import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import * as shortid from 'shortid';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const swal = withReactContent(Swal);

import UrlMap from './url';
import styles from './../css/_pages.scss';

const INPUT_URI_LENGTH = 9;

export default withRouter(class SelectMenu extends React.Component<RouteComponentProps, {}> {
    inputFocus: React.RefObject<HTMLInputElement>;

    constructor(props) {
        super(props);
    }
    render(): React.ReactNode {
        return (<>
<div id={styles.index}>
    <section className={styles.dTransition} onTouchStart={this.hoverDecoration} onTouchEnd={this.hoverRemoveDecoration}>
        <Link to={UrlMap.generateInputNameUrl(shortid.generate())}>
            <div>
                <h3>New room</h3>
            </div>
        </Link>
    </section>
    <nav>
        <div className={styles.textCenter}>
            <h3>Card Game</h3>
            <p>合計が101を超えたら負け.</p>
            <small>Lose when the total exceeds 101.</small>
        </div>
        <aside>
            <p><a href="https://shop.neu-icarus.com/items/192061">neu</a> のルールとカードの種類を参考にさせていただきました。</p>
            <p>よろしければ、実際のゲームをご購入いただき、大切な方とお楽しみ下さい。</p>
        </aside>
    </nav>
    <section className={styles.dTransition} onTouchStart={this.hoverDecoration} onTouchEnd={this.hoverRemoveDecoration}>
        <div onClick={e => swal.fire({
            title: 'Input RoomID',
            text: `※RoomID: ${INPUT_URI_LENGTH}characters.`,
            input: 'text',
            showCancelButton: true,
            reverseButtons: true,
            confirmButtonText: 'Enter',
            cancelButtonText: 'Back',
            inputValidator: inputValue => {
                let hasError:boolean = !shortid.isValid(inputValue) || INPUT_URI_LENGTH < inputValue.length;
                if (hasError) {
                    return 'Invalid RoomID format.';
                }
            }
        }).then(result => {
            if (result.isConfirmed) {
                let roomId = result.value;
                this.props.history.push(UrlMap.generateInputNameUrl(roomId));
            }
        })}>
            <h3>Enter room</h3>
        </div>
    </section>
</div>
        </>);
    }

    hoverDecoration(event: React.TouchEvent) {
        event.currentTarget.classList.add(styles.hover);
    }
    hoverRemoveDecoration(event: React.TouchEvent) {
        event.currentTarget.classList.remove(styles.hover);
    }

});
