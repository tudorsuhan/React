import React, { Component } from 'react';

export default class Display extends Component {
    render() {
        return <div className="calculator__display">{this.props.displayValues}</div>
    }
}