import * as React from 'react';
import { Link } from 'react-router-dom';
import * as shortid from 'shortid';

import UrlMap from './url';
import styles from './../css/_index.scss';

const INPUT_URI_LENGTH = 9;
interface StateType {
    roomId: string;
    errorMsg: string;
}

export default class SelectMenu extends React.Component<{}, StateType> {
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
        let hasError = this.state.roomId != undefined && INPUT_URI_LENGTH <= this.state.roomId.length && this.state.errorMsg != '';
        let accurateInput = this.state.roomId != undefined && INPUT_URI_LENGTH <= this.state.roomId.length && this.state.errorMsg === '';
        return (<>
<div className={styles.leaningOverall}>
    <section className={styles.leftSide}>
        <Link to={UrlMap.generateInputNameUrl(shortid.generate())}>
            <div>
                <h3>New room</h3>
            </div>
        </Link>
    </section>
    <section className={styles.rightSide}>
        <div>
            <div>
                <h3>Input RoomID</h3>
                <div>
                    <label>RoomID: <input type="text" value={this.state.roomId} onChange={this.roomIdInput} ref={this.inputFocus} /></label>
                    {hasError ? (<p>{this.state.errorMsg}</p>) : null}
                    {hasError ? (<p>※input format is {INPUT_URI_LENGTH} characters.</p>) : null}
                    {accurateInput ? (<Link to={UrlMap.generateInputNameUrl(this.state.roomId)}>{linkBtnView}</Link>) : (<span style={{pointerEvents: "none"}}>{linkBtnView}</span>)}
                </div>
            </div>
        </div>
    </section>
</div>
        </>);
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
