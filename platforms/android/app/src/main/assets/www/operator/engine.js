var operator_start = JSON.parse(localStorage.engineOperator);
var no_unit = operator_start.no_unit;
var shift = operator_start.shift;
var keterangan;
$("#display_me").text("Saya, " + operator_start.nrp);
var material = null, metode = null, aktivitas = null, muatan = parseInt(0), status = null, muatanPerJam = 0;
var statusEngine = 0;
var loadingTime = "", totalCountLoading = 0;
var iconStop = '<i class="fas fa-pause-circle text-danger"></i>';
var iconStart = '<i class="fas fa-play-circle text-success"></i>';
//   var btnTriggerTimer = $(".btn-trigger-timer");
// variabel untuk timer awal sampai akhir
var h1 = $(".engine-timer"), seconds = 0, minutes = 0, hours = 0, t;
// variabel untuk durasi activity
var durasiActivity = $(".durasi-activity"), secondsAct = 0, minutesAct = 0, hoursAct = 0, tAct;
var mWorld, sWorld, hWorld;
// variabel untuk durasi status
var durasiStatus = $(".durasi-status"), secondsStatus = 0, minutesStatus = 0, hoursStatus = 0, tStatus;
var secondLoad = 0, minuteLoad = 0, hourLoad = 0, tLoad = 0;
var ACCUMULATIVE_SECOND_LOAD = 0, ACCUMULATIVE_MINUTE_LOAD = 0, ACCUMULATIVE_HOUR_LOAD = 0, ACCUMULATIVE_LOAD;
var ACCUMULATIVETIMER = '00:00:00';
var loadTimer = "00:00:00";
// variabel untuk engine control
var engineControl = $("#content-engine-control");
var btnEngineControl = $("#btn-engine-control");
// variabel untuk string timer
var runningTimer = '00:00:00', actTimer = '00:00:00', statTimer = '00:00:00';
var all_productivity_unit = 0, actual_productivity_unit = 0, effectivness = parseFloat(0), ritase_sebelum = 0, ritase_sekarang = 0;
var engineMinute = 0;
var hitungPerJam = parseInt(0);
var reset_ritase = '';

var all_productive_table = '<table class="table table-borderless m-0 p-0">';
all_productive_table += '<tr>';
all_productive_table += '<td class="text-center" valign="middle"><b>All:</b></td>';
all_productive_table += '<td class="text-center row" valign="middle"><b class="col-7" id="all_productive"></b><small class="col-4"><u style="margin-bottom:0.001em">BCM</u><br>JAM</small></td>';
// table += '<td class="text-center"></td>';
all_productive_table += '</tr>';
all_productive_table += '</table>';
document.getElementById("allProductivity").innerHTML = all_productive_table;

var act_productive_table = '<table class="table table-borderless m-0 p-0">';
act_productive_table += '<tr>';
act_productive_table += '<td class="text-center" valign="middle"><b>Act:</b></td>';
act_productive_table += '<td class="text-center row" valign="middle"><b class="col-7" id="act_productive"></b><small class="col-4"><u style="margin-bottom:0.001em">BCM</u><br>JAM</small></td>';
// table += '<td class="text-center"></td>';
act_productive_table += '</tr>';
act_productive_table += '</table>';
document.getElementById("acitivityProductivity").innerHTML = act_productive_table;

// FOR TIMER WORLD
var t2;

var app = {
    init: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function () {
        window.screen.orientation.lock('landscape-primary');
        if (localStorage.dataEngine != null || localStorage.dataEngine != "" || localStorage != "undefined") {
            localStorage.removeItem("dataEngine");
        }
        document.addEventListener("offline", this.onOffline, false);
        document.addEventListener("online", this.onOnline, false);
        document.getElementById("content-engine-control").addEventListener("click", controlEngine);
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("menubutton", onMenuKeyDown, false);
        document.addEventListener("backbutton", onBackKeyDown, false);
        document.getElementById("btn-engine-control").addEventListener("click", this.controlEngine, false);
        document.getElementById("selesai-kerja").addEventListener("click", FinalDone, false);

        app.startTime();
        app.loadMaterial();
        app.loadActivity();
        app.loadMuatan();
        app.loadMetode();
        app.loadStatus();
        app.initialize_engine();
    },
    onOffline: function () {
        console.log("lost connection");
    },
    onOnline: function () {
        console.log('Connection type: ' + app.NetworkState());
        if (app.NetworkState() !== Connection.NONE) {
            console.log(!!localStorage.dataEngine);
            if (!!localStorage.dataEngine) {
                app.tryUploadData();
            }
        }
    },
    NetworkState: () => navigator.connection.type,
    tryUploadData: function () {
        var str_data_engine = localStorage.dataEngine;
        var dataEngine = JSON.parse(str_data_engine);
        var str_local_storage = "Data Local Storage : ";
        console.log(str_local_storage);
        console.log(str_data_engine);
        if (dataEngine.data.length > 0) {
            $.post(url + "api/engine/create", dataEngine).then(onSuccessSubmitting).done(onDoneSubmitting).fail(onFailSubmitting);
            localStorage.removeItem("dataEngine");
        }
    },
    timer_status_engine_per_hour: 0,
    engine_minute_per_hour: 0,
    engine_second_per_hour: 0,
    engine_per_hour: () => {
        app.timer_status_engine_per_hour = setTimeout(app.engine_per_hour_add, 1000);
    },
    engine_hour_per_hour: 0,
    engine_per_hour_add: () => {
        app.engine_second_per_hour++;
        if (app.engine_second_per_hour >= 60) {
            app.engine_minute_per_hour++;
            if (app.engine_minute_per_hour >= 60) {
                app.engine_minute_per_hour = 0;
                app.engine_hour_per_hour += 1;
            }
        }
        app.engine_per_hour();
    },
    startTime: () => startTime(),
    loadMaterial: () => loadMaterial(),
    loadActivity: () => loadActivity(),
    loadMetode: () => loadMetode(),
    loadMuatan: () => loadMuatan(),
    loadStatus: () => loadStatus(),
    createdBy: operator_start.created_by,
    change_ritase: function () {
        if (app.on_time_reset_ritase) {
            ritase_sebelum = ritase_sekarang;
            ritase_sekarang = 0;
            document.getElementById("ritase_sebelum").innerText = ritase_sebelum;
            document.getElementById("ritase_sekarang").innerText = ritase_sekarang;
            actual_productivity_unit = parseFloat(0);
            reset_ritase = '';
            app.on_time_reset_ritase = false;
            app._actual_productivity_();
        }
    },
    setActualProductivity: () => app._actual_productivity_(),
    initialize_engine: function () {
        $(".engineStarted").hide();
        $("#btn-engine-control").show();
        statusEngine = 0;
        storage.setItem('statusEngine', statusEngine);
        engineControl.html('Engine&nbsp;' + iconStart);
        engineControl.removeClass("bg-success");
        btnEngineControl.removeClass("btn-danger");
        btnEngineControl.addClass("btn-success");
        btnEngineControl.html("START ENGINE");
        // btnEngineControl.attr('onclick', 'controlEngine()');
        console.log("status engine : " + statusEngine);
        $("#engineStatus").html('<p class="p-0 m-0 text-danger">Engine Off<i class="material-icons">flash_off</i></p>');
        if (statusEngine == 0) {
            engineControl.html('Engine&nbsp;' + iconStart);
        } else {
            engineControl.html('Engine&nbsp;' + iconStop);
        }
    },
    _all_productivity_: function () {
        var allPdty = parseFloat(0);
        if (minutes != 0 && seconds != 0 && muatan > 0) {
            var pembagi = (hours + ((minutes + 1) / 60));
            var allProd = parseFloat(muatan / pembagi);
            if (isFinite(allProd) || isNaN(allProd)) {
                allPdty = allProd;
            } else {
                allPdty = parseFloat(muatan);
            }
        }
        all_productivity_unit = allPdty.toFixed(2);
        document.getElementById("all_productive").innerHTML = allPdty.toFixed(2);
    },
    _actual_productivity_: () => {
        var act_prod = parseFloat(0);
        // console.log("Actual Productivity : " + muatanPerJam);
        if (minutes != 0 && seconds != 0 && muatanPerJam > 0) {
            var pembagi = ((minutes + 1) / 60);
            act_prod = parseFloat(muatanPerJam / pembagi);
            actual_productivity_unit = act_prod;
        }
        document.getElementById("act_productive").innerHTML = act_prod.toFixed(2);
    },
    _effectiveness_: () => {
        if (aktivitas == "001") {
            var engineTimer = (hours * 60) + (minutes);
            var actTimerNow = (hourLoad * 60) + (minuteLoad);
            effectivness = parseFloat(actTimerNow / engineTimer) * 100;
            var displayEffectivness = parseFloat('0').toFixed(2);
            if (!isNaN(effectivness)) {
                displayEffectivness = parseFloat(effectivness).toFixed(2);
            }
            $("#efektf").html("<strong>" + displayEffectivness + "%</strong>");
        }
    },
    check_engine_lipat: () => check_engine_lipat(),
    controlEngine: function () {
        if (statusEngine == 0) {
            timer();
            statusEngine = 1;
            storage.setItem('statusEngine', statusEngine);
            engineControl.html('Engine&nbsp;' + iconStop);
            engineControl.addClass("bg-success");
            btnEngineControl.removeClass("btn-success");
            btnEngineControl.addClass("btn-danger");
            btnEngineControl.html("SELESAI KERJA");
            btnEngineControl.attr('onclick', 'doneWork()');
            console.log("status engine : " + statusEngine);
            $("#btn-engine-control").hide();
            $(".engineStarted").show();
            $("#engineStatus").html('<p class="p-0 m-0 text-success">Engine On<i class="material-icons">flash_on</i></p>');
            if (secondsAct > 0 || minutesAct > 0 || hoursAct > 0) {
                timerActivity();
                if (aktivitas == "001") { timerLoading(); ACCUMULATIVELoading() }
            }
            if (secondsStatus > 0 || minutesStatus > 0 || hoursStatus > 0) {
                timerStatus();
            }
            var segmen = "Engine On";
            keterangan = "Engine On";
            submitting(segmen, keterangan);
        } else {
            $(".engineStarted").hide();
            $("#btn-engine-control").show();

            statusEngine = 0;
            storage.setItem('statusEngine', statusEngine);
            engineControl.html('Engine&nbsp;' + iconStart);
            engineControl.removeClass("bg-success");
            btnEngineControl.removeClass("btn-danger");
            btnEngineControl.addClass("btn-success");
            btnEngineControl.html("START ENGINE");
            btnEngineControl.attr('onclick', 'controlEngine()');
            console.log("status engine : " + statusEngine);
            $("#engineStatus").html('<p class="p-0 m-0 text-danger">Engine Off<i class="material-icons">flash_off</i></p>');

            clearTimeout(tAct); clearTimeout(tLoad); clearTimeout(ACCUMULATIVE_LOAD);
            clearTimeout(t);
            clearTimeout(tLoad);
            // if (secondsAct > 0 || minutesAct > 0 || hoursAct > 0) {

            // }
            if (secondsStatus > 0 || minutesStatus > 0 || hoursStatus > 0) {
                clearTimeout(tStatus);
            }
            var segmen = "Engine Off";
            keterangan = "Engine Off";
            submitting(segmen, keterangan);
        }
    },
    on_time_reset_ritase: false,
    check_time: (i) => {
        return (i < 10) ? "0" + i : i;
        // if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
        // return i;
    }
}


// START WORLD TIME

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var mili = today.getMilliseconds();
    hWorld = h;
    mWorld = m;
    sWorld = s;
    h = app.check_time(h);
    m = app.check_time(m);
    s = app.check_time(s);
    $(".Hours").html(h + ":" + m + ":" + s);

    if (s == 59 && m == 59) {

        // RESET ACCUMULATIVE LOADING TIME PER HOUR
        if (!app.on_time_reset_ritase) {
            app.on_time_reset_ritase = true;
            setTimeout(function () { submitting("Reset Ritase", "Reset Ritase") }, 1000);
        }
        clearTimeout(ACCUMULATIVE_LOAD);
        ACCUMULATIVE_HOUR_LOAD = 0, ACCUMULATIVE_MINUTE_LOAD = 0, ACCUMULATIVE_SECOND_LOAD = 0;

        if (aktivitas == "001") {
            ACCUMULATIVELoading();
        }
        // CLEAR ACCUMULATIVE LOADING TIMER
        muatanPerJam = 0;
        t2 = setTimeout(startTime, 1000);
    }
    app._all_productivity_();
    app._actual_productivity_();
    t2 = setTimeout(startTime, 1000);
}
// function checkTime(i) {
//     if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
//     return i;
// }

// ACCUMULATIVE ALL LOADING TIME
function timerLoading() {
    tLoad = setTimeout(addLoading, 1000);
}

function addLoading() {
    secondLoad++;
    if (secondLoad >= 60) {
        secondLoad = 0;
        minuteLoad++;
        if (minuteLoad >= 60) {
            minuteLoad = 0;
            hourLoad++;
            clearTimeout(app.timer_status_engine_per_hour);
            app.engine_minute_per_hour = 0, app.engine_second_per_hour = 0;
            app.engine_per_hour();
        }
    }
    loadTimer = (hourLoad ? (hourLoad > 9 ? hourLoad : "0" + hourLoad) : "00") + ":" + (minuteLoad ? (minuteLoad > 9 ? minuteLoad : "0" + minuteLoad) : "00") + ":" + (secondLoad > 9 ? secondLoad : "0" + secondLoad);

    if (secondLoad > 0 || secondLoad > 0) {
        hitungPerJam = hours + 1;
    }

    app._effectiveness_();

    timerLoading();

}

// ACCUMULATIVE LOADING TIME PER HOUR
function ACCUMULATIVELoading() {
    ACCUMULATIVE_LOAD = setTimeout(addACCUMULATIVELoading, 1000);
}

function addACCUMULATIVELoading() {
    ACCUMULATIVE_SECOND_LOAD++;
    if (ACCUMULATIVE_SECOND_LOAD >= 60) {
        ACCUMULATIVE_SECOND_LOAD = 0;
        ACCUMULATIVE_MINUTE_LOAD++;
        if (ACCUMULATIVE_MINUTE_LOAD >= 60) {
            ACCUMULATIVE_MINUTE_LOAD = 0;
            ACCUMULATIVE_HOUR_LOAD++;
        }
    }
    ACCUMULATIVETIMER = (ACCUMULATIVE_HOUR_LOAD ? (ACCUMULATIVE_HOUR_LOAD > 9 ? ACCUMULATIVE_HOUR_LOAD : "0" + ACCUMULATIVE_HOUR_LOAD) : "00") + ":" + (ACCUMULATIVE_MINUTE_LOAD ? (ACCUMULATIVE_MINUTE_LOAD > 9 ? ACCUMULATIVE_MINUTE_LOAD : "0" + ACCUMULATIVE_MINUTE_LOAD) : "00") + ":" + (ACCUMULATIVE_SECOND_LOAD > 9 ? ACCUMULATIVE_SECOND_LOAD : "0" + ACCUMULATIVE_SECOND_LOAD);
    ACCUMULATIVELoading();
}

function onLoad() {
    app.init();
}
$(document).ready(app.onDeviceReady);

function set_up_control_engine_1() {
    $(".engineStarted").hide();
    $("#btn-engine-control").show();
    statusEngine = 0;
    storage.setItem('statusEngine', statusEngine);
    engineControl.html('Engine&nbsp;' + iconStart);
    engineControl.removeClass("bg-success");
    btnEngineControl.removeClass("btn-danger");
    btnEngineControl.addClass("btn-success");
    btnEngineControl.html("START ENGINE");
    btnEngineControl.attr('onclick', 'controlEngine()');
    console.log("status engine : " + statusEngine);
    $("#engineStatus").html('<p class="p-0 m-0 text-danger">Engine Off<i class="material-icons">flash_off</i></p>');
    if (statusEngine == 0) {
        engineControl.html('Engine&nbsp;' + iconStart);
    } else {
        engineControl.html('Engine&nbsp;' + iconStop);
    }
}

function onBackKeyDown() {
    // Handle the back button
    const message = "Semua Aktifitas Engine Akan dihentikan dan direstart?";
    const title = "Membatalkan semua aktifitas engine";
    const buttonLabels = ["Oke", "Cancel"];
    navigator.notification.confirm(message, confirmBackButton, title, buttonLabels);
}

var confirmBackButton = (buttonPressed) => {
    if (buttonPressed == 1) {

    } else {

    }
}

function effectivnessTime() {
    if (aktivitas == "001") {
        var engineTimer = (hours * 60) + (minutes);
        var actTimerNow = (hourLoad * 60) + (minuteLoad);
        effectivness = parseFloat(actTimerNow / engineTimer) * 100;
        var displayEffectivness = parseFloat('0').toFixed(2);
        if (!isNaN(effectivness)) {
            displayEffectivness = parseFloat(effectivness).toFixed(2);
        }
        $("#efektf").html("<strong>" + displayEffectivness + "%</strong>");
    } else {

    }

}

function controlEngine() {
    if (statusEngine == 0) {
        timer();
        app.engine_per_hour();
        statusEngine = 1;
        storage.setItem('statusEngine', statusEngine);
        engineControl.html('Engine&nbsp;' + iconStop);
        engineControl.addClass("bg-success");
        btnEngineControl.removeClass("btn-success");
        btnEngineControl.addClass("btn-danger");
        btnEngineControl.html("SELESAI KERJA");
        btnEngineControl.attr('onclick', 'doneWork()');
        console.log("status engine : " + statusEngine);
        $("#btn-engine-control").hide();
        $(".engineStarted").show();
        $("#engineStatus").html('<p class="p-0 m-0 text-success">Engine On<i class="material-icons">flash_on</i></p>');
        if (secondsAct > 0 || minutesAct > 0 || hoursAct > 0) {
            timerActivity();
            if (aktivitas == "001") { timerLoading(); ACCUMULATIVELoading() }
        }
        if (secondsStatus > 0 || minutesStatus > 0 || hoursStatus > 0) {
            timerStatus();
        }
        var segmen = "Engine On";
        keterangan = "Engine On";
        submitting(segmen, keterangan);
    } else {
        $(".engineStarted").hide();
        $("#btn-engine-control").show();

        statusEngine = 0;
        storage.setItem('statusEngine', statusEngine);
        engineControl.html('Engine&nbsp;' + iconStart);
        engineControl.removeClass("bg-success");
        btnEngineControl.removeClass("btn-danger");
        btnEngineControl.addClass("btn-success");
        btnEngineControl.html("START ENGINE");
        btnEngineControl.attr('onclick', 'controlEngine()');
        console.log("status engine : " + statusEngine);
        $("#engineStatus").html('<p class="p-0 m-0 text-danger">Engine Off<i class="material-icons">flash_off</i></p>');

        clearTimeout(tAct); clearTimeout(tLoad); clearTimeout(ACCUMULATIVE_LOAD);
        clearTimeout(t);
        clearTimeout(tLoad);
        clearTimeout(app.timer_status_engine_per_hour);

        if (secondsStatus > 0 || minutesStatus > 0 || hoursStatus > 0) {
            clearTimeout(tStatus);
        }
        var segmen = "Engine Off";
        keterangan = "Engine Off";
        submitting(segmen, keterangan);
    }
}

function allProductivityHTML() {
    var allPdty = parseFloat(0);

    var M = (seconds > 0) ? minutes + 1 : minutes;
    var H = hours;
    var pembagi = (H + ((minutes + 1) / 60));
    var allProd = parseFloat(muatan / pembagi);

    if (isFinite(allProd) || isNaN(allProd)) {
        allPdty = allProd;
    } else {
        allPdty = parseFloat(muatan);
    }

    all_productivity_unit = allPdty.toFixed(2);


    document.getElementById("all_productive").innerHTML = allPdty.toFixed(2);
}

function actProductivityHTML() {
    var act_prod = parseFloat(0);
    console.log("Actual Productivity : " + muatanPerJam);
    if (minutes != 0 && seconds != 0) {
        if (muatanPerJam > 0) {
            var M1 = (seconds > 0) ? minutes + 1 : minutes;
            var pem = M1 / 60;
            act_prod = parseFloat(muatanPerJam / pem);
            actual_productivity_unit = act_prod;
        } else {
            act_prod = parseFloat(0);
        }
    }
    document.getElementById("act_productive").innerHTML = act_prod.toFixed(2);
}

function timer() {
    t = setTimeout(add, 1000);
}

function add() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    runningTimer = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    h1.html(runningTimer);
    if (seconds > 0 || minutes > 0) {
        hitungPerJam = hours + 1;
    }

    effectivnessTime();
    timer();
}

function stopActivityTimer(tAct) {
    clearTimeout(tAct);
}

function timerActivity() {
    tAct = setTimeout(addActTimer, 1000);
}

function addActTimer() {
    secondsAct++;
    if (secondsAct >= 60) {
        secondsAct = 0;
        minutesAct += 1;
        if (minutesAct >= 60) {
            minutesAct = 0;
            hoursAct += 1;
        }
    }
    actTimer = (hoursAct ? (hoursAct > 9 ? hoursAct : "0" + hoursAct) : "00") + ":" + (minutesAct ? (minutesAct > 9 ? minutesAct : "0" + minutesAct) : "00") + ":" + (secondsAct > 9 ? secondsAct : "0" + secondsAct);
    setLoadingTime();
    durasiActivity.html(actTimer);
    timerActivity();
}

function timerStatus() {
    tStatus = setTimeout(addStatusTimer, 1000);
}

function addStatusTimer() {
    secondsStatus++;
    if (secondsStatus >= 60) {
        secondsStatus = 0;
        minutesStatus++;
        if (minutesStatus >= 60) {
            minutesStatus = 0;
            hoursStatus++;
        }
    }
    statTimer = (hoursStatus ? (hoursStatus > 9 ? hoursStatus : "0" + hoursStatus) : "00") + ":" + (minutesStatus ? (minutesStatus > 9 ? minutesStatus : "0" + minutesStatus) : "00") + ":" + (secondsStatus > 0 ? secondsStatus : "0" + secondsStatus);
    durasiStatus.html(statTimer);
    timerStatus();
}

function doneWork() {
    $("#hm_akhir").modal("show");
}

function FinalDone() {
    if ($("[name=hm]").val != "") {
        statusEngine = 0;
        clearTimeout(t);
        var segmen = "Selesai Kerja";
        submitting(segmen, segmen);
        var id = operator_start.id;
        $.ajax({
            url: url + "Operator/updateActivityHMAkhir",
            type: 'POST',
            data: { id: id, hm: $("[name=hm]").val() },
            dataType: "JSON",
            async: false,
            success: function (e) {
                if (e.response == "success") {
                    clearTimeout(tAct);
                    secondsAct = 0, minutesAct = 0, hoursAct = 0, tAct;
                    clearTimeout(tStatus);
                    secondsStatus = 0, minutesStatus = 0, hoursStatus = 0, tStatus = 0;
                    window.localStorage.clear();
                    window.location.href = "../login/index.html";
                } else {
                    navigator.notification.alert(
                        'Peneyelesaian Kerjaan Gagal',  // message
                        alertDismissed,         // callback
                        'Gagal',            // title
                        'Tutup'
                    );
                    return false;
                }
            },
            error: function (e) {
                navigator.notification.alert(
                    'Peneyelesaian Kerjaan Gagal',  // message
                    alertDismissed,         // callback
                    'Gagal',            // title
                    'Tutup'
                );
                return false;
            }
        });

    } else {
        navigator.notification.alert(
            'HM akhir mohon di Input',  // message
            alertDismissed,         // callback
            'Gagal',            // title
            'Tutup'
        );
        return false;
    }
}

function onConfirm(index) {
    alert("Button clicked is : " + index);
}


function setMaterial(e) {
    if (statusEngine == 0) {
        // alert("Engine Timer Belum Aktif");
        engineNotStart();
        return false;
    }
    material = e;
    keterangan = $("#labelMaterial" + e).data("material");
    console.log('Material Set To : ' + material);
    $(".material-type").html('<small><b>' + keterangan + '</b></small>');
    var segmen = "Material";
    submitting(segmen, keterangan);
}

function setMetode(e) {
    if (statusEngine == 0) {
        // alert("Engine Timer Belum Aktif");
        $("input[name=metode]:radio:checked").prop('checked', false);
        engineNotStart();
        return false;
    }
    if (e == null) {
        e = "&nbsp;";
    }
    var segmen = "Metode";
    metode = e;
    keterangan = $("#labelMetode" + e).data("metode");

    submitting(segmen, keterangan);
    $("#dispMetode").html(keterangan);
    console.log('Metode Set To : ' + keterangan);
    $("#metode").html("<b>" + metode + "</b>");
}

function setSubmitAktifitas(e) {
    if (statusEngine == 0) {
        $("#kodeAct").val("");
        $('#myModal').modal('toggle');
        engineNotStart();
        return false;
    }

    $.ajax({
        url: url + 'Activity/getByKode',
        type: 'GET',
        async: false,
        data: { kode: e },
        dataType: 'JSON',
        success: function (e) {
            $("#activity-now").html("<b>" + e.activity + "</b>");
            console.log('Aktivitas Set To : ' + e.activity);
            aktivitas = e.kode;
            setAktifitias(aktivitas);
            // submitting();
            $("[name=aktifitas]").prop('checked', false);
            $("[name=aktifitas][value=" + e.kode + "]").prop('checked', true);
            $('#myModal').modal('hide');
        },
        error: function (e) {
            $('#myModal').modal('hide');
            notFound(e.response);
        }
    });
}

function setAktifitias(e) {
    if (statusEngine == 0) {
        $("input[name=aktifitas]").prop('checked', false);
        engineNotStart();
        return false;
    }
    // aktivitas = e;
    if (aktivitas !== null) {
        submitting("Aktifitas", aktivitas);
    }
    if (aktivitas == "001") {
        // muatanPerJam = 0;
        // timerLoading();
    } else {
        // clearTimeout(tLoad);
    }
    keterangan = $("#labelAktifitas" + e).data("aktifitas");
    if (aktivitas !== e) {
        aktivitas = e;
        if (aktivitas == "001") {
            timerLoading();
            ACCUMULATIVELoading()
        } else {
            clearTimeout(tLoad);
            clearTimeout(ACCUMULATIVE_LOAD);
        }
    }
    var segmen = "Aktifitas";
    submitting(segmen, keterangan);
    secondsAct = 0, minutesAct = 0, hoursAct = 0, tAct;
    // console.log(hoursAct + ":" + minutesAct + ":" + secondsAct);
    clearTimeout(tAct);
    timerActivity();

    $("#activity-now").html("<b>" + keterangan + "</b>");


}

function check_engine_lipat() {
    if (keterangan == "ENGINE MATI/LIPAT") {
        $(".engineStarted").hide();
        $("#btn-engine-control").show();
        clearTimeout(t);
        statusEngine = 0;
        storage.setItem('statusEngine', statusEngine);
        engineControl.html('Engine&nbsp;' + iconStart);
        engineControl.removeClass("bg-success");
        btnEngineControl.removeClass("btn-danger");
        btnEngineControl.addClass("btn-success");
        btnEngineControl.html("START ENGINE");
        btnEngineControl.attr('onclick', 'controlEngine()');
        console.log("status engine : " + statusEngine);
        $("#engineStatus").html('<p class="p-0 m-0 text-danger">Engine Off<i class="material-icons">flash_off</i></p>');
        if (secondsAct > 0 || minutesAct > 0 || hoursAct > 0) {
            clearTimeout(tAct)
        }
        if (secondsStatus > 0 || minutesStatus > 0 || hoursStatus > 0) {
            clearTimeout(tStatus);
        }
        var segmen = "Status";
        submitting(segmen, keterangan);
        return false;
    } else {
        return true;
    }
}

function setLoadingTime() {
    if (aktivitas == "001") {
        if (loadingTime != "" && totalCountLoading > 1) {
            var splitLoadTimer = loadingTime.split(":");
            var totalSecondAct = secondsAct + parseInt(splitLoadTimer[2]);
            var totalMinuteAct = minutesAct + parseInt(splitLoadTimer[1]);
            var totalHourAct = hoursAct + parseInt(splitLoadTimer[0]);
            if (totalSecondAct >= 60) {
                totalMinuteAct += 1;
                totalSecondAct = totalSecondAct - 60;
            }
            if (totalMinuteAct >= 60) {
                totalHourAct += 1;
                totalMinuteAct = totalMinuteAct - 60;
            }
            loadingTime = (totalHourAct ? (totalHourAct > 9 ? totalHourAct : "0" + totalHourAct) : "00") + ":" + (totalMinuteAct ? (totalMinuteAct > 9 ? totalMinuteAct : "0" + totalMinuteAct) : "00") + ":" + (totalSecondAct > 9 ? totalSecondAct : "0" + totalSecondAct);
        } else {
            loadingTime = actTimer;
        }
    }
}

function setStatus(kode) {

    if (statusEngine == 0) {
        engineNotStart();
        return false;
    }
    if ($("[name=status]:checked").val() == "") {
        kodeStatusFalse();
    }
    status = kode;
    var segmen = "Status";
    var vStatus = $("#labelStatus" + kode).data("status");
    keterangan = vStatus;
    if (app.check_engine_lipat) {
        clearTimeout(tStatus);
        secondsStatus = 0, minutesStatus = 0, hoursStatus = 0, tStatus = 0;
        status = kode;
        $("#status-now").html("<b>" + $("#labelStatus" + kode).text() + "</b>");
        submitting(segmen, keterangan);
        timerStatus();
    }
}

function setMuatan(e) {
    if (statusEngine == 0) {
        // alert("Engine Timer Belum Aktif");
        $("input[name=muatan]:radio:checked").prop("checked", false);
        console.log("Gagal Set Muatan");
        engineNotStart();
        return false;
    }
    keterangan = e;
    console.log("Muatan : " + e);
    muatan += parseInt(e);
    muatanPerJam += parseInt(e);
    ritase_sekarang += 1;
    keterangan = e + "BCM";

    var segmen = "Muatan";
    allProductivityHTML();
    app.setActualProductivity();
    localStorage.setItem("muatan", muatan);
    $("#ritase_sekarang").text(ritase_sekarang);
    // $("#acitivityProductivity").text(acitivityProductivity + "");
    submitting(segmen, keterangan);

}

// function setStatus(e){

// }

function notFound(e) {
    navigator.notification.alert(
        e,  // message
        alertDismissed,         // callback
        'Gagal',            // title
        'OK'                  // buttonName
    );
}

function onPause() {
    // Handle the pause event
}

function onResume() {
    // Handle the resume event
}

function onMenuKeyDown() {
    // Handle the menubutton event
}

function engineNotStart() {
    // navigator.notification.beep(1);
    navigator.notification.alert(
        'Engine Timer Belum Aktif',  // message
        alertDismissed,         // callback
        'Gagal',            // title
        'OK'                  // buttonName
    );
}

function kodeStatusFalse() {
    // navigator.notification.beep(1);
    navigator.notification.alert(
        'Kode Status Belum Terisi Dengan Benar',  // message
        alertDismissed,         // callback
        'Gagal',            // title
        'OK'                  // buttonName
    );
    return false;
}

function loadMaterial() {
    $.ajax({
        url: url + "Material/get_all",
        async: false,
        dataType: "JSON",
        success: function (e) {
            if (e.response == "success") {
                var menuitem = '<span class="dropdown-item">-</span>';
                var data = e.data;
                console.log(data);
                $.each(data, function (k, v) {
                    menuitem += '<a class="dropdown-item" href="#!" onclick="setMaterial(\'' + v.kode_material + '\')" id="labelMaterial' + v.kode_material + '" data-material="' + v.jenis + '">' + v.jenis + '</a>';
                });
                console.log(menuitem);
                document.getElementById("dropdownmenumaterial").innerHTML = menuitem;
                // $(".dropdownmenumaterial").html();
            }
        }
    })
}

function loadActivity() {
    $.ajax({
        url: url + 'Activity/getAll',
        success: function (e) {
            console.log(e);
            var allActivity = '';
            var lainnyaActivity = '';
            $.each(e, function (i, isi) {
                if (i < 9) {
                    allActivity += '<div class="col-4 m-0 custom-control custom-radio"><label for="aktifitias' + i + '" class="btn btn-light border border-dark btn-block text-left align-middle" style="font-size:14px !important; font-weight:bold;" data-aktifitas="' + isi.aktivitas + '" id="labelAktifitas' + isi.kode + '"><input type="radio" name="aktifitas" id="aktifitias' + i + '" autocomplete="off" value="' + isi.kode + '" onclick="setAktifitias(this.value)"> <br>' + isi.aktivitas + '</label></div>';
                } else {
                    lainnyaActivity += '<div class="col-4 m-0 custom-control custom-radio"><label for="aktifitias' + i + '" class="btn btn-light border border-dark btn-block text-left align-middle" style="font-size:14px !important; font-weight:bold;" data-aktifitas="' + isi.aktivitas + '" id="labelAktifitas' + isi.kode + '"><input type="radio" name="aktifitas" id="aktifitias' + i + '" autocomplete="off" value="' + isi.kode + '" onclick="setAktifitias(this.value)"> <br>' + isi.aktivitas + '</label></div>';
                }
            });
            allActivity += '<div class="col-12 mb-2 bt-1"><button class="btn btn-block btn-danger btn-sm text-center border border-dark align-middle" data-target="#myModal" data-toggle="modal" type="button" style="font-size:14px !important; font-weight:bold;">Problem Aktifitas Lainnya</button></div>';
            document.getElementById("allActivity").innerHTML = allActivity;
            // $("#allActivity").html(allActivity);
            document.getElementById("aktifitas-lainnya").innerHTML = lainnyaActivity;
            // $("#aktifitas-lainnya").html(lainnyaActivity);
        }
    });

}

function loadMuatan() {
    $.ajax({
        url: url + 'Muatan/getAll',
        success: function (e) {
            console.log(e);
            var allMuatan = '';
            $.each(e, function (i, isi) {
                allMuatan += '<div class="col-6"><button type="button" class="btn btn-light btn-block btn-lg border-dark py-2" style="font-size:18px !important" id="muatan' + i + '" onclick="setMuatan(' + isi.kode + ')"> <b>' + isi.status + '</b></button></div>';
            });
            document.getElementById("listMuatan").innerHTML = allMuatan;
            // $("#listMuatan").html(allMuatan);
        },
        error: function (e) {
            alert("Koneksi buruk");
        }
    });
}

function loadMetode() {
    $.ajax({
        url: url + 'Metode/getAll',
        success: function (e) {
            console.log(e);
            var allMetode = '';
            $.each(e, function (i, isi) {
                allMetode += '<div class="col-6"><label for="metode' + i + '" class="btn border border-dark btn-block btn-lg text-left p-1" style="font-weight:bold" id="labelMetode' + isi.id + '" data-metode="' + isi.metode + '"><input type="radio" name="metode" id="metode' + i + '" onclick=setMetode(this.value) autocomplete="off" value="' + isi.id + '"> ' + isi.display + '</label></div>';
            });
            document.getElementById("allMetode").innerHTML = allMetode;
            // $("#allMetode").html(allMetode);
        }
    })
}

function loadStatus() {
    $.ajax({
        url: url + 'Activity/getAllStatus',
        async: false,
        success: function (e) {
            console.log(e);
            var allStatus = '';
            allStatus += ''
            $.each(e, function (i, isi) {
                allStatus += '<div class="col-4 m-0 custom-control custom-radio"><label for="status' + isi.kode + '" class="btn btn-light border border-dark btn-block btn-lg text-left" id="labelStatus' + isi.kode + '" style="font-size:10px !important; font-weight:bolder;" data-status="' + isi.aktivitas + '"><input type="radio" name="status" id="status' + isi.kode + '" autocomplete="off" value="' + isi.kode + '" onchange="setStatus(' + isi.kode + ')"><br>' + isi.aktivitas + '</label></div>';
            });
            document.getElementById("status-lainnya").innerHTML = allStatus;
            // $("#status-lainnya").html(allStatus);
        }
    });
}

function submitting(segmen, keterangan) {
    console.log("SEGMEN: " + segmen);

    // var reset_ritase = '';
    if (segmen == "Reset Ritase") {
        reset_ritase = segmen;
        segmen = (localStorage.segmen == "Muatan") ? "Aktifitas" : localStorage.segmen;
        keterangan = (localStorage.keterangan == "11BCM" || localStorage.keterangan == "12BCM" || localStorage.keterangan == "14BCM") ? "LOADING" : localStorage.keterangan;
    }
    localStorage.setItem("segmen", segmen);
    localStorage.setItem("keterangan", keterangan);
    // actual_productivity_unit = actual_productivity_unit;
    dataInsert = {
        material: material,
        metode: metode,
        aktivitas: aktivitas,
        muatan: muatan,
        status: status,
        statusEngine: statusEngine,
        runningTimer: runningTimer,
        actTimer: actTimer.toString(),
        statTimer: statTimer.toString(),
        createdBy: app.createdBy,
        all_productivity_unit: all_productivity_unit.toString(),
        activity_productivity_unit: actual_productivity_unit.toString(),
        effectivness: effectivness.toFixed(2),
        ritase_sebelum: ritase_sebelum,
        ritase_sekarang: ritase_sekarang,
        jam_sekarang: $(".Hours").html(),
        id_activity_operator: operator_start.id,
        segmen: segmen,
        actual_prod: muatanPerJam,
        keterangan: keterangan,
        unit: no_unit,
        shift: shift,
        ACCUMULATIVETIMERPERHOUR: ACCUMULATIVETIMER
    };
    if (!localStorage.dataEngine) {
        var dataArray = { data: [] };
        dataArray.data.push(dataInsert);
        var dataString = JSON.stringify(dataArray);
        localStorage.setItem("dataEngine", dataString);
    } else {
        var dataArray = JSON.parse(localStorage.dataEngine);
        dataArray.data.push(dataInsert);
        var dataString = JSON.stringify(dataArray);
        localStorage.setItem("dataEngine", dataString);
    }
    var dataEngineStorage = JSON.parse(localStorage.dataEngine);
    dataInsert = dataEngineStorage;

    if (app.on_time_reset_ritase) {
        setTimeout(app.change_ritase, 1000);
    }
    if (app.NetworkState() !== Connection.NONE) {
        $.post(url + "api/engine/create", dataInsert).then(onSuccessSubmitting).done(onDoneSubmitting).fail(onFailSubmitting);
    } else {
        console.log("DATA STORED IN LOCAL");
    }
}

function onSuccessSubmitting(e, status) {
    console.log("SUKSES UPLOAD DATA");
    localStorage.removeItem("dataEngine");
    $("#myModal").modal("hide");
    $("#modalStatus").modal("hide");
    $("#modalMetode").modal("hide");
}

function onFailSubmitting(e, status) {
    console.log("DATA STORED IN LOCAL");
    return false;
}

function onDoneSubmitting() {

}

function resetRitase() {
    ritase_sebelum = ritase_sekarang;
    ritase_sekarang = 0;
    $("#ritase_sebelum").text(ritase_sebelum);
    $("#ritase_sekarang").text(ritase_sekarang);
    actual_productivity_unit = parseFloat(0);
    reset_ritase = '';
}

function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.CELL] = 'Cell generic connection';
    states[Connection.NONE] = 'No network connection';
    return states[networkState];
}

function alertDismissed() {
    // do something
}