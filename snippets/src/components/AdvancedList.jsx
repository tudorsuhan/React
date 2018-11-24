import React, { Component, Fragment } from 'react';
import { compose } from 'recompose';

const applyUpdateResult = (result) => (prevState) => ({
    hits: [...prevState.hits, ...result.hits],
    page: result.page,
    isError: false,
    isLoading: false,
});

const applySetResult = (result) => (prevState) => ({
    hits: result.hits,
    page: result.page,
    isError: false,
    isLoading: false,
});

const applySetError = (prevState) => ({
    isError: false,
    isLoading: false,
});

const getHackerNewsUrl = (value, page) =>
    `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

export default class AdvancedListComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hits: [],
            page: null,
            isLoading: false,
            isError: false,
        };
    }

    fetchStories = (value, page) => {
        this.setState({ isLoading: true });
        fetch(getHackerNewsUrl(value, page))
            .then(response => response.json())
            .then(result => this.onSetResult(result, page))
            .catch(this.onSetError);
    }

    onSetError = () =>
        this.setState(applySetError);

    onSetResult = (result, page) =>
        page === 0
            ? this.setState(applySetResult(result))
            : this.setState(applyUpdateResult(result));

    render() {
        const { hits, isError, isLoading, page } = this.state;
        return (
            <div className="page">
                <div className="interactions">
                    <form type="submit" onSubmit={this.onInitialSearch}>
                        <input type="text" ref={node => this.input = node} />
                        <button type="submit">Search</button>
                    </form>
                </div>

                <AdvancedList
                    list={hits}
                    isError={isError}
                    isLoading={isLoading}
                    page={page}
                    onPaginatedSearch={this.onPaginatedSearch}
                />
            </div>
        );
    }
}

const withPaginated = (Component) => (props) =>
    <div>
        <Component {...props} />
        <div className="interactions">
            {
                (props.page !== null && !props.isLoading && props.isError) &&
                <div>
                    <div>Something went wrong...</div>
                    <button type="button" onClick={props.onPaginatedSearch}>Try Again</button>
                </div>
            }
        </div>
    </div>

const withInfiniteScroll = (Component) =>
    class WithInfiniteScroll extends React.Component {
        componentDidMount = () => {
            window.addEventListener('scroll', this.onScroll, false);
        }

        componentWillMount = () => {
            window.removeEventListener('scroll', this.onScroll, false);
        }

        onScroll = () => {
            if (
                (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500) &&
                this.props.list.length &&
                !this.props.isLoading &&
                !this.props.isError
            ) {
                this.props.onPaginatedSearch();
            }
        }

        render() {
            return <Component {...this.props} />;
        }
    }

const withLoading = (Component) => (props) =>
    <Fragment>
        <Component {...props} />
        <div className="interactions">
            {props.isLoading && <span>Loading...</span>}
        </div>
    </Fragment>

const List = ({ list }) =>
    <div className="list">
        {list.map(item => <div className="list-row" key={item.objectID}>
            <a href={item.url}>{item.title}</a>
        </div>)}
    </div>

const AdvancedList = compose(
    withPaginated,
    withInfiniteScroll,
    withLoading,
)(List);