import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';


class GatewayProfileExtraChannel extends Component {
  constructor() {
    super();

    this.onChange = this.onChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onChange(field, e) {
    let channel = this.props.channel;

    if (field === "spreadingFactorsStr") {
      channel[field] = e.target.value;
      let sfStr = e.target.value.split(",");
      channel["spreadingFactors"] = sfStr.map((sf, i) => parseInt(sf, 10));
    } else if (e.target.type === "number") {
      channel[field] = parseInt(e.target.value, 10);
    } else {
      channel[field] = e.target.value;
    }

    this.props.onChange(channel);
  }

  onSelectChange(field, val) {
    let channel = this.props.channel;
    channel[field] = val.value;
    this.props.onChange(channel);
  }

  onDelete(e) {
    e.preventDefault();
    this.props.onDelete();
  }

  render() {
    const modulations = [
      {value: "LORA", label: "LoRa"},
      {value: "FSK", label: "FSK"},
    ];

    var spreadingFactorsStr = "";
    if (this.props.channel.spreadingFactors !== undefined && this.props.channel.spreadingFactorsStr === undefined) {
      spreadingFactorsStr = this.props.channel.spreadingFactors.join(", ");
    } else if (this.props.channel.spreadingFactorsStr !== undefined) {
      spreadingFactorsStr = this.props.channel.spreadingFactorsStr;
    }

    return(
      <fieldset>
        <legend>
          Extra channel #{this.props.i + 1} (<a href="#remove" onClick={this.onDelete}>remove</a>)
        </legend>
        <div className="form-group">
          <label className="control-label" htmlFor="modulation">Modulation</label>
          <Select
            name="modulation"
            options={modulations}
            value={this.props.channel.modulation}
            onChange={this.onSelectChange.bind(this, 'modulation')}
            clearable={false}
          />
        </div>
        <div className="form-group">
          <label className="control-label" htmlFor="frequency">Frequency (Hz)</label>
          <input className="form-control" name="frequency" id="frequency" type="number" placeholder="e.g. 867100000" required value={this.props.channel.frequency || ''} onChange={this.onChange.bind(this, 'frequency')} />
        </div>
        <div className="form-group">
          <label className="control-label" htmlFor="bandWidth">Bandwidth (kHz)</label>
          <input className="form-control" name="bandwidth" id="bandwidth" type="number" placeholder="e.g. 125" required value={this.props.channel.bandwidth || ''} onChange={this.onChange.bind(this, 'bandwidth')} />
          <p className="help-block">
            Valid values are: 125 kHz, 250 kHz and 500 kHz.
          </p>
        </div>
        <div className={"form-group " + (this.props.channel.modulation === "LORA" ? "" : "hidden")}>
          <label className="control-label" htmlFor="spreadFactors">Spreading-factors</label>
          <input className="form-control" name="spreadingFactors" id="spreadingFactorsStr" type="text" placeholder="e.g. 7, 8, 9, 10, 11, 12" required={this.props.channel.modulation === "LORA"} value={spreadingFactorsStr} onChange={this.onChange.bind(this, 'spreadingFactorsStr')} />
          <p className="help-block">
            When defining multiple spreading-factors, the channel will be configured as a multi-SF channel on the gateway.
          </p>
        </div>
        <div className={"form-group " + (this.props.channel.modulation === "FSK" ? "" : "hidden")}>
          <label className="control-label" htmlFor="bitrate">Bitrate</label>
          <input className="form-control" name="bitrate" id="bitrate" type="number" placeholder="e.g. 50000" required={this.props.channel.modulation === "FSK"} value={this.props.channel.bitrate || ''} onChange={this.onChange.bind(this, 'bitrate')} />
        </div>
      </fieldset>
    );
  }
}

class GatewayProfileForm extends Component {
  constructor() {
    super();

    this.state = {
      profile: {
        gatewayProfile: {},
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateExtraChannel = this.updateExtraChannel.bind(this);
    this.deleteExtraChannel = this.deleteExtraChannel.bind(this);
    this.addExtraChannel = this.addExtraChannel.bind(this);
  }

  componentDidMount() {
    let profile = this.props.profile;
    if (profile.gatewayProfile !== undefined && profile.gatewayProfile.channels !== undefined && profile.gatewayProfile.channelsStr === undefined) {
      profile.gatewayProfile.channelsStr = profile.gatewayProfile.channels.join(", ");
    }

    this.setState({
      profile: profile,
    });
  }

  componentWillReceiveProps(nextProps) {
    let profile = nextProps.profile;
    if (profile.gatewayProfile !== undefined && profile.gatewayProfile.channels !== undefined && profile.gatewayProfile.channelsStr === undefined) {
      profile.gatewayProfile.channelsStr = profile.gatewayProfile.channels.join(", ");
    }

    this.setState({
      profile: profile,
    });
  }

  onChange(fieldLookup, e) {
    let lookup = fieldLookup.split(".");
    const fieldName = lookup[lookup.length-1];
    lookup.pop(); // remove last item

    let profile = this.state.profile;
    let obj = profile;

    for(const f of lookup) {
      obj = obj[f];
    }

    if (fieldName === "channelsStr") {
      let channelsStr = e.target.value.split(",");
      obj[fieldName] = e.target.value;
      obj["channels"] = channelsStr.map((c, i) => parseInt(c, 10));
    } else {
      obj[fieldName] = e.target.value;
    }

    this.setState({
      profile: profile,
    });
  }

  updateExtraChannel(i, ec) {
    let profile = this.state.profile;
    profile.gatewayProfile.extraChannels[i] = ec;

    this.setState({
      profile: profile,
    });
  }

  deleteExtraChannel(i) {
    let profile = this.state.profile;
    profile.gatewayProfile.extraChannels.splice(i, 1);
    this.setState({
      profile: profile,
    });
  }
  
  addExtraChannel() {
    let profile = this.state.profile;
    if (profile.gatewayProfile.extraChannels === undefined) {
      profile.gatewayProfile.extraChannels = [{}];
    } else {
      profile.gatewayProfile.extraChannels.push({});
    }

    this.setState({
      profile: profile,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.profile);
  }

  render() {
    let extraChannelRows = [];

    if (this.state.profile.gatewayProfile.extraChannels !== undefined) {
      extraChannelRows = this.state.profile.gatewayProfile.extraChannels.map((ec, i) => <GatewayProfileExtraChannel key={i} channel={ec} i={i} onChange={(ec) => this.updateExtraChannel(i, ec)} onDelete={() => this.deleteExtraChannel(i)} />);
    }

    return(
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label className="control-label" htmlFor="name">Name</label>
          <input className="form-control" id="name" type="text" placeholder="a short name identifying the gateway-profile" required value={this.state.profile.name || ''} onChange={this.onChange.bind(this, 'name')} />
        </div>
        <div className="form-group">
          <label className="control-label" htmlFor="name">Enabled channels</label>
          <input className="form-control" id="channelsStr" type="text" placeholder="0, 1, 2" required pattern="[0-9]+(,[\s]*[0-9]+)*" value={this.state.profile.gatewayProfile.channelsStr || ''} onChange={this.onChange.bind(this, 'gatewayProfile.channelsStr')} />
          <p className="help-block">
            The channels active in this gateway-profile as specified in the LoRaWAN Regional Parameters sepecification.
            Separate channels by comma, e.g. 0, 1, 2. Extra channels must not be included in this list.
          </p>
        </div>
        {extraChannelRows}
        <a onClick={this.addExtraChannel} className="btn btn-sm btn-default">Add extra channel</a>
        <hr />
        <div className="btn-toolbar pull-right">
          <a className="btn btn-default" onClick={this.props.history.goBack}>Go back</a>
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
    );
  }
}

export default withRouter(GatewayProfileForm);
