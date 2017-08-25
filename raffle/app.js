function secondsToStr (seconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    var years = Math.floor(seconds / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    var days = Math.floor((seconds %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((seconds %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((seconds %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = seconds % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}

function startApp(web3) {
    var abi = JSON.parse('[{"constant":true,"inputs":[],"name":"contractStartTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getElapsedTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"beneficiary","type":"bytes32"}],"name":"buyTickets","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"numTickets","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"realTimeLeft","outputs":[{"name":"","type":"int256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"seed","type":"bytes32"}],"name":"chooseWinner","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"tickets","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getBlocktimeTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"serverSeedHash","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"lastBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"clientSeed","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"ethereumFoundationTickets","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"getRefund","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"winner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"chooseWinnerDeadline","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getRaffleTimeLeft","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[{"name":"secretHash","type":"bytes32"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"value","type":"address"}],"name":"Winner","type":"event"}]');
    var RaffleContract = web3.eth.contract(abi);

    var contractInstance = RaffleContract.at('0xf6ACaF5aA6b25ABdB2Af45C7590948ee29a812B5');

    var updateRaffleState = function () {
        contractInstance.numTickets({from: web3.eth.accounts[0]}, function (err, result) {
            $("#ticketsSold").text(result);
            $("#balance").text(parseInt(result) * 0.01);
        });
        contractInstance.ethereumFoundationTickets({from: web3.eth.accounts[0]}, function (err, result) {
            $("#ethereumFoundationTickets").text(result);
        });
        contractInstance.serverSeedHash({from: web3.eth.accounts[0]}, function (err, result) {
            $("#hashedSecret").text(result);
        });
        contractInstance.clientSeed({from: web3.eth.accounts[0]}, function (err, result) {
            $("#clientSeed").text(result);
        });
        contractInstance.winner({from: web3.eth.accounts[0]}, function (err, winner) {
            if(winner === '0x0000000000000000000000000000000000000000') {
                $("#winnerContainer").hide();
                contractInstance.getRaffleTimeLeft({from: web3.eth.accounts[0]}, function (err, timeLeft) {
                    var timeLeftSeconds = parseInt(timeLeft);
                    if (timeLeftSeconds == 0) {
                        $("#raffleTimeLeft").text("none; raffle has finished");
                        $("#buy-tickets").addClass('pure-button-disabled');
                        $("#get-refund").show();
                    } else {
                        $("#raffleTimeLeft").text(secondsToStr(timeLeftSeconds));
                    }
                });
            } else {
                $("#raffleTimeLeftContainer").hide();
                $("#winnerContainer").show();
                $("#winner").text(winner);
                $("#buy-tickets").addClass('pure-button-disabled');
            }
        });

    };

    $("#buy-tickets").click(function () {
        var beneficiary = $("#beneficiary").val();
        var ether = parseInt($("#tickets").val()) * 0.01;

        contractInstance.buyTickets(beneficiary, {
            from: web3.eth.accounts[0],
            value: web3.toWei(ether, 'ether')
        }, function (err, result) {
            if (err) {
                // TODO
            } else {
                // TODO result is the address of the transaction
                alert("Tickets bought, maybe."+result);
            }
            // TODO wait for confirmation
            // TODO show deadline
            // TODO show winner, if any
        });
        return false;
    });

    $("#get-refund").click(function () {
        contractInstance.getRefund(function (err, result) {
            alert(err || result);
        });
    });

    updateRaffleState();
}

$(document).ready(function () {

    // Check if Web3 has been injected by the browser:
    if (typeof web3 !== 'undefined') {
        // You have a web3 browser! Continue below!
        $("#web3-enabled").show();
        $("#web3-disabled").hide();
        startApp(new Web3(web3.currentProvider || "ws://localhost:8546"));
    }

});

