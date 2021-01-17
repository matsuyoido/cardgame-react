import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Switch, Route, Redirect } from 'react-router-dom';
import { createBrowserHistory } from "history";
const history = createBrowserHistory();
// React Router の使い方
// https://reactrouter.com/web/guides/quick-start

import UrlMap from './url';
import SelectMenu from './_index';
import InputName from './_enter';
import PlayingBoard from './_playing';

interface SessionAttribute {
    name: string;
}


class App extends React.Component<{}, SessionAttribute> {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
        };
        this.setName = this.setName.bind(this);
    }

    setName(nameValue: string) {
        this.setState({
            name: nameValue
        });
    }

    render() {
        return (<>
<Router history={history}>
    <div>
        <Switch>
            <Route exact path="/" component={SelectMenu}></Route>
            <Route exact path={UrlMap.inputNameUrl()} render={props => <InputName setNameFunc={this.setName} {...props} />}></Route>
            <Route exact path={UrlMap.playingUrl()} render={props => {
                let roomId = props.match.params[UrlMap.ROOMID_URI_VARIABLE_NAME];
                console.info(`roomID: ${roomId}`);
                if (this.state.name === '') {
                    return <Redirect to={UrlMap.generateInputNameUrl(roomId)} />
                } else {
                    return <PlayingBoard roomId={roomId} playerName={this.state.name} />
                }
            }}></Route>
            <Route path="*" component={SelectMenu}></Route>
        </Switch>
    </div>
</Router></>);
    }
}

ReactDOM.render(
    (<App></App>),
    document.getElementById('root')
);

