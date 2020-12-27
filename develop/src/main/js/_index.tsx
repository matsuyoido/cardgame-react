import * as React from 'react';
import { Link } from 'react-router-dom';
import * as shortid from 'shortid';

import UrlMap from './url';

const INPUT_URI_LENGTH = 9;
interface StateType {
    roomId: string;
    errorMsg: string;
}

class RoomIdInputSection extends React.Component<{}, StateType> {
    inputFocus: React.RefObject<HTMLInputElement>;

    constructor(props) {
        super(props);
        this.state = {
            roomId: '',
            errorMsg: ''
        };
        this.inputFocus = React.createRef();
        this.roomIdInput = this.roomIdInput.bind(this);
    }
    componentDidUpdate() {
        // renderによってinputが切り替わり、focusが外れるためその対策
        this.inputFocus.current.focus();
    }
    render(): React.ReactNode {
        let linkBtnView = 'Enter room';
        let notError = this.state.errorMsg === '';
        let notInput = this.state.roomId === undefined || this.state.roomId.length < INPUT_URI_LENGTH;
        if (notInput) {
            return (<section>
                <h3>Input roomID</h3>
                <div>
                    <label>RoomID: <input type="text" value={this.state.roomId} onChange={this.roomIdInput} ref={this.inputFocus} /></label>
                    <p>※input format is {INPUT_URI_LENGTH} characters.</p>
                </div>
            </section>);
        } else if (notError) {
            return (<section>
                <div>
                    <label>RoomID: <input type="text" value={this.state.roomId} onChange={this.roomIdInput} ref={this.inputFocus} /></label>
                </div>
                <Link to={UrlMap.generateInputNameUrl(this.state.roomId)}>{linkBtnView}</Link>
            </section>);
        } else {
            return (<section>
                <div>
                    <label>RoomID: <input type="text" value={this.state.roomId} onChange={this.roomIdInput} ref={this.inputFocus} /></label>
                    <p>{this.state.errorMsg}</p>
                </div>
                <a href="javascript:void(0)" style={{pointerEvents: "none"}}>{linkBtnView}</a>
            </section>);
        }
    }

    roomIdInput(event) {
        let inputValue: string;
        let hasError: boolean;

        inputValue = event.target.value;
        hasError = !shortid.isValid(inputValue) || INPUT_URI_LENGTH < inputValue.length;
        this.setState({
            roomId: inputValue,
            errorMsg: hasError ? 'Invalid RoomID format' : ''
        });
    }
}

export default class SelectMenu extends React.Component {

    render(): React.ReactNode {
        return (<div>
            <section>
                <Link to={UrlMap.generateInputNameUrl(shortid.generate())}>New room</Link>
            </section>
            <RoomIdInputSection />
        </div>);
    }

};
