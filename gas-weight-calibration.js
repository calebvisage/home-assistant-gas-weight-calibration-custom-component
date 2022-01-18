import "https://unpkg.com/wired-card@0.8.1/wired-card.js?module";
import "https://unpkg.com/wired-toggle@0.8.0/wired-toggle.js?module";
import {
    LitElement,
    html,
    css
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

function loadCSS(url) {
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
}

class GasWeightCalibrationCustomComponent extends LitElement {
    static get properties() {
        return {
            hass: {},
            config: {},
        };
    }

    render() {

        const stateObj = this.hass.states[this.config.entities[0]];
        return html`

            <ha-card>
                <div class="header" style="padding: 16px 16px 0px; display: flex; justify-content: space-between; align-items: center; align-content: center;">
                    <h4 style="color: grey; font-weight: 600; font-size: 16px; white-space: nowrap; margin: 0;">Gas-Weight Calibration</h4>
                    <div class="icon">
                        <ha-state-icon data-state="0.0"></ha-state-icon>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-around; align-items: center; align-content: center; padding: 16px">
                    <p><b>Calibrate Raw Empty:</b> Weight the empty gas bottle then press the button.</p>
                    <button @click="${() => this._setRawEmpty(stateObj)}" style="background-color: dodgerblue; border: none; border-radius: 32px; padding: 8px 16px; color: white">Calibrate Raw Empty</button>
                </div>
                <div style="display: flex; justify-content: space-around; align-items: center; align-content: center; padding: 16px">
                    <p><b>Calibrate Raw Full:</b> Weight the full gas bottle then press the button.</p>
                    <button @click="${() => this._setRawFull(stateObj)}" style="background-color: dodgerblue; border: none; border-radius: 32px; padding: 8px 16px; color: white">Calibrate Raw Full</button>
                </div>
                <div style="display: flex; justify-content: space-around; align-items: center; align-content: center; padding: 16px">
                    <p><b>Calibrate KG Empty:</b> Weight the empty gas bottle then press the button.</p>
                    <input value="${this.hass.states[`${stateObj.entity_id}_kg_empty`] ? this.hass.states[`${stateObj.entity_id}_kg_empty`].state : null}" placeholder="KG Empty" type="number" @input="${event => this._setKgEmpty(stateObj, event)}"></input>
                </div>
                <div style="display: flex; justify-content: space-around; align-items: center; align-content: center; padding: 16px">
                    <p><b>Calibrate KG Full:</b> Weight the full gas bottle then press the button.</p>
                    <input value="${this.hass.states[`${stateObj.entity_id}_kg_full`] ? this.hass.states[`${stateObj.entity_id}_kg_full`].state : null}" placeholder="KG Full" type="number" @input="${event => this._setKgFull(stateObj, event)}"></input>
                </div>

                <hr style="border-color: grey;">

                <div class="row">
                    <p><b>Raw: ${stateObj.state}</b></p>
                    <button @click="${() => this._calibrate(stateObj)}">Submit</button>
                </div>
            </ha-card>
    `;
    }

    _setKgEmpty = (kgEmpty, event) => {
        // console.log('kgEmpty', kgEmpty);
        var entity_id = `${kgEmpty.entity_id}_kg_empty`;
        var friendly_name = `${kgEmpty.attributes.friendly_name}_kg_empty`;
        var value = event.target.value;
        this._updateEntity(entity_id, value, friendly_name);
    }

    _setKgFull = (kgFull, event) => {
        // console.log('kgFull', kgFull);
        var entity_id = `${kgFull.entity_id}_kg_full`;
        var friendly_name = `${kgFull.attributes.friendly_name}_kg_full`;
        var value = event.target.value;

        this._updateEntity(entity_id, value, friendly_name);
    }

    _setRawEmpty = (rawEmpty) => {
        // console.log('rawEmpty', rawEmpty);
        var entity_id = `${rawEmpty.entity_id}_raw_empty`;
        var friendly_name = `${rawEmpty.attributes.friendly_name}_raw_empty`;
        var value = rawEmpty.state;
        this._updateEntity(entity_id, value, friendly_name);
    }

    _setRawFull = (rawFull) => {
        // console.log('rawFull', rawFull);
        var entity_id = `${rawFull.entity_id}_raw_full`;
        var friendly_name = `${rawFull.attributes.friendly_name}_raw_full`;
        var value = rawFull.state;
        this._updateEntity(entity_id, value, friendly_name);
    }


    _updateEntity = (entity_id, value, friendly_name = "undefined_entity") => {
        fetch(`/api/states/${entity_id}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIzMTU3YjBjNzA0NjE0OTI3YWU4MTBhMGViZTQ1YzU0MyIsImlhdCI6MTY0MjA2MDcyNCwiZXhwIjoxOTU3NDIwNzI0fQ.z1yAMtFvZTZIAJ0CLxgW3z2obj5BV98Yh2OAiFsO_YE',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                state: value,
                attributes: {
                    friendly_name: friendly_name,
                }
            })
        }).then(response => {
            // console.log(response);
        });
    }

    _doSetFieldValue = (event) => {
        var entity_id = event.target.id;
        var value = event.target.value;
        var friendly_name = event.target.name;
        this._updateEntity(entity_id, value, friendly_name);
    }

    _calibrate = (stateObj) => {

        var kgEmpty = this.hass.states[`${stateObj.entity_id}_kg_empty`];
        var kgFull = this.hass.states[`${stateObj.entity_id}_kg_full`];

        var rawEmpty = this.hass.states[`${stateObj.entity_id}_raw_empty`];
        var rawFull = this.hass.states[`${stateObj.entity_id}_raw_full`];

        var top_e = Math.abs(parseFloat(stateObj.state)) + Math.abs(parseFloat(rawEmpty.state));
        var e = parseFloat(rawFull.state) - parseFloat(rawEmpty.state);
        e = e / parseFloat(kgFull.state);

        var z = top_e / e;
        var out = Math.floor(Math.abs((z / parseFloat(kgFull.state)) * 100));

        var entity_id = `${stateObj.entity_id}_percentage`;
        var friendly_name = "Weight Percentage";

        fetch(`/api/states/${entity_id}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIzMTU3YjBjNzA0NjE0OTI3YWU4MTBhMGViZTQ1YzU0MyIsImlhdCI6MTY0MjA2MDcyNCwiZXhwIjoxOTU3NDIwNzI0fQ.z1yAMtFvZTZIAJ0CLxgW3z2obj5BV98Yh2OAiFsO_YE', // this is a temporary api key, use your own
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                state: out,
                attributes: {
                    unit_of_measurement: '%',
                    friendly_name: friendly_name,
                }
            })
        }).then(response => {
            // console.log(response);
        });
    };

    setConfig(config) {
        console.log('config', config);
        if (!config.entities) {
            throw new Error("You need to define entities");
        }
        this.config = config;
    }

    getCardSize() {
        return this.config.entities.length + 1;
    }

    static get styles() {
        return css`
      :host {
        font-family: sans-serif;
      }
      wired-card {
        background-color: white;
        padding: 16px;
        display: block;
        font-size: 18px;
      }
      .state {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        align-items: center;
      }
      .row {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        align-items: center;
      }
      .not-found {
        background-color: yellow;
        font-family: sans-serif;
        font-size: 14px;
        padding: 8px;
      }
      wired-toggle {
        margin-left: 8px;
      }
    `;
    }
}

customElements.define("gas-weight-calibration-custom-component", GasWeightCalibrationCustomComponent);
window.customCards = window.customCards || [];
window.customCards.push({
    type: "gas-weight-calibration-custom-component",
    name: "Gas Weight Calibration Custom Component",
    preview: false, // Optional - defaults to false
    description: "Calibrate the weight of a gas bottle" // Optional
});