/** @type {HTMLInputElement} */
var inp_IP_ADDRESS = document.getElementById('inp_IP_ADDRESS');
/** @type {HTMLInputElement} */
var inp_PORT_NUMBER = document.getElementById('inp_PORT_NUMBER');

var IP_ADDRESS = inp_IP_ADDRESS?.placeholder || 'localhost';
var PORT_NUMBER = inp_PORT_NUMBER?.placeholder || 8088;

var VMIX_INPUTS_CONTAINER = document.getElementById('vmix_inputs');

/** @type {[{}]} */
var vMixInputs = [];

function sendProto(url, callback, type = 'json') {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: type,
    })
        .done(function (data) {
            // データの取得に成功した場合の処理を記述します
            callback(data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            // データの取得に失敗した場合の処理を記述します
            console.error(textStatus, errorThrown); // エラー内容をコンソールに表示します
            console.log(jqXHR);
            callback(false);
        });
}

function sendVMixFunc(functionName, params, callback) {
    if (functionName) params.Function = functionName;
    let url = `http://${IP_ADDRESS}:${PORT_NUMBER}/api/?` + new URLSearchParams(params).toString();
    sendProto(url, callback, functionName ? 'json' : 'xml');
}

function getVMixData(callback = (_) => {}) {
    lastGetVMixDataTime = Date.now();
    sendVMixFunc('', {}, (data) => {
        lastGetVMixDataTime = Date.now();
        // Debug
        // もしdataがfalseならば、仮データを発行します
        if (!data) {
            vMixInputs = [
                { key: '51443cf4-ec02-4579-80ae-471f3880f42b', number: '1', type: 'Video', title: 'chanpion_sample.avi', shortTitle: 'chanpion_sample.avi', state: 'Paused', position: '2905', duration: '3504', loop: 'False' },
                { key: '2c172025-727a-413e-b349-35d5f748f42d', number: '2', type: 'Colour', title: 'Colour Bars', shortTitle: 'Colour Bars', state: 'Paused', position: '0', duration: '0', loop: 'False' },
                { key: 'da14fcf1-0185-4bd9-8b9c-15d8fb775fa1', number: '3', type: 'Colour', title: 'Colour', shortTitle: 'Colour', state: 'Paused', position: '0', duration: '0', loop: 'False' },
                { key: 'e08b1098-31c1-40ff-b238-1baf1c37e2b9', number: '4', type: 'Browser', title: 'Browser pp.dodoneko.site', shortTitle: 'Browser pp.dodoneko.site', state: 'Running', position: '0', duration: '0', loop: 'False', muted: 'True', volume: '100', balance: '0', solo: 'False', audiobusses: 'M', meterF1: '0', meterF2: '0', gainDb: '0' },
                { key: '8fb345d0-e984-4e79-92f6-ae4bfc834176', number: '5', type: 'Virtual', title: 'Virtual - chanpion_sample.avi', shortTitle: 'chanpion_sample.avi', state: 'Paused', position: '0', duration: '0', loop: 'False' },
                { key: 'b3a06d22-9822-4b76-8352-2134b0e10579', number: '6', type: 'Virtual', title: 'Virtual - chanpion_sample.avi', shortTitle: 'chanpion_sample.avi', state: 'Paused', position: '0', duration: '0', loop: 'False' },
                { key: '7433384d-7829-4c9f-94af-32d37daf2836', number: '7', type: 'NDI', title: 'NDI DODO-FLOW13X (vMix - Output 4)', shortTitle: 'NDI DODO-FLOW13X (vMix - Output 4)', state: 'Running', position: '0', duration: '0', loop: 'False', muted: 'True', volume: '100', balance: '0', solo: 'False', audiobusses: 'M', meterF1: '0', meterF2: '0', gainDb: '0', selectedIndex: '0' },
            ];
        } else {
            let inputs = data.getElementsByTagName('input');

            // inputsに無いkeyを持つvMixInputsの要素を削除します
            vMixInputs = vMixInputs.filter((v) => [...inputs].findIndex((vv) => vv.value == v.key) != -1);

            for (let inp of inputs) {
                let input_object = {};
                for (let i = 0; i < inp.attributes.length; i = 0 | (i + 1)) {
                    let attr = inp.attributes.item(i);
                    input_object[attr.name] = attr.value;
                }
                if (vMixInputs.findIndex((v) => v.key == inp.key) == -1) {
                    vMixInputs.push(input_object);
                } else {
                    vMixInputs[vMixInputs.findIndex((v) => v.key == inp.key)] = input_object;
                }
            }
        }

        // console.log('finish getVMixData');

        callback();
    });
}

/**
 * vMixInputsをもとに、VMIX_INPUTS_CONTAINER内に要素を作成する関数です。
 * 作成する要素は、クリックすることでアクションを起こすdiv要素です。
 * アクションとは、その要素を選択したというフラグを立てることです。
 * ドラッグアンドドロップで順番を入れ替える機能を持ちます。
 * また、表示非表示を切り替える機能を持ちます。
 */
function createVMixInputs() {
    // console.log('createVMixInputs');

    // vMixInputsに無いkeyを持つ.vmix_inputを削除します
    for (let elem of document.querySelectorAll('.vmix_input')) {
        if (vMixInputs.findIndex((v) => v.key == elem.dataset.key) == -1) {
            elem.remove();
        }
    }

    for (let input of vMixInputs) {
        let elem = document.querySelector(`[data-key="${input.key}"]`);
        if (!elem) {
            elem = document.createElement('div');
            elem.classList.add('vmix_input');
            elem.dataset.key = input.key;
            elem.addEventListener('click', function () {
                document.querySelectorAll('.vmix_input.active').forEach((elem) => {
                    elem.classList.remove('active');
                });
                this.classList.toggle('active');
            });
            VMIX_INPUTS_CONTAINER.appendChild(elem);
        }

        if (elem.innerText != input.shortTitle) elem.innerHTML = `<span>${input.shortTitle}</span>`;
    }
}

((_) => {
    getVMixData(createVMixInputs);
})();

var lastGetVMixDataTime = 0;
(function loop() {
    requestAnimationFrame(loop);

    if (Date.now() - lastGetVMixDataTime > 1000) {
        getVMixData(createVMixInputs);
    }
})();

window.addEventListener('load', changeColor);

/**
 * inp_COLORSETを元に、bodyのクラスを変える関数です。
 */
function changeColor() {
    let body = document.body;
    let inp_COLORSETs = document.querySelectorAll('#setting_color input[type=radio]');
    for (let inp of inp_COLORSETs) {
        body.classList.toggle(inp.value, inp.checked);
    }
}

$(function () {
    $('#vmix_inputs').sortable();
    $('#vmix_inputs').disableSelection();
});
