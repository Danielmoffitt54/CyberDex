import React, { Component } from 'react';
import './Header.css';

export default class Header extends Component {

    render() {
        const { children } = this.props;

        return(
            <div className='Header'>
                <div className='Header-main'>
                    {children}
                </div>
            </div>
        );
    }
}