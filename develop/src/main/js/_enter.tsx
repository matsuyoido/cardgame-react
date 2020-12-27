import * as React from 'react';
import { Link } from 'react-router-dom';

import UrlMap from './url';

interface PropType {
    setNameFunc: Function;
}
interface StateType {
    hasError: boolean;
}

export default class InputName extends React.Component<PropType, StateType> {
    roomId: string;
    inputFocus: React.RefObject<HTMLInputElement>;

    constructor(props) {
        super(props);
        let requestParam = new URLSearchParams(props.location.search);
        this.roomId = requestParam.get(UrlMap.ROOMID_PARAM_NAME);
        this.inputFocus = React.createRef();

        this.state = {
            hasError: true
        };
        this.setName = this.setName.bind(this);
    }

    componentDidUpdate() {
        // renderによってinputが切り替わり、focusが外れるためその対策
        this.inputFocus.current.focus();
    }
    setName(e) {
        let inputName: string = e.target.value;
        this.setState({
            hasError: (inputName === undefined || inputName.trim().length === 0)
        });
        this.props.setNameFunc(inputName.trim());
    }

    render() {
        if (this.state.hasError) {
            return (
<div>
    <label>Input your name: <input type="text" onChange={this.setName} ref={this.inputFocus} /></label>
</div>
            );
        } else {
            return (
<div>
    <label>Input your name: <input type="text" onChange={this.setName} ref={this.inputFocus} /></label>
    <Link to={UrlMap.generatePlayingUrl(this.roomId)}>Enter room</Link>
</div>
            );
        }
    }

};