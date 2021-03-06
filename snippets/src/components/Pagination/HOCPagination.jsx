import React, { Component, Fragment } from 'react';
import { compose } from 'recompose';

const applyUpdateResult = (result) => (prevState) => ({
    hits: [...prevState.hits, ...result.hits],
    page: result.page,
    isLoading: false,
});

const applySetResult = (result) => (prevState) => ({
    hits: result.hits,
    page: result.page,
    isLoading: false,
});

const getGackerNewsUrl = (value, page) =>
    `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

export default class Pagination extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hits: [],
            page: null,
            isLoading: false,
        };
    }

    onInitialSearch = (event) => {
        event.preventDefault();
        const { value } = this.input;
        if (value === '') {
            return;
        }
        this.fetchStories(value, 0);
    }

    onPaginatedSearch = () =>
        this.fetchStories(this.input.value, this.state.page + 1);

    fetchStories = async (value, page) => {
        this.setState({ isLoading: true });
        await fetch(getGackerNewsUrl(value, page))
            .then(response => response.json())
            .then(result => this.onSetResult(result, page));
    }

    onSetResult = (result, page) =>
        page === 0
            ? this.setState(applySetResult(result))
            : this.setState(applyUpdateResult(result))

    render() {
        const { hits, page, isLoading } = this.state;
        console.log(hits)
        return (
            <div className="page">
                <div className="interactions">
                    <form type="submit" onSubmit={this.onInitialSearch}>
                        <input type="text" ref={node => this.input = node} />
                        <button type="submit">Search</button>
                    </form>
                </div>

                <ListWithLoadingWithPaginated
                    list={hits}
                    isLoading={isLoading}
                    page={page}
                    onPaginatedSearch={this.onPaginatedSearch}
                />
            </div>
        );
    }
}

const withLoading = (Component) => (props) =>
    <Fragment>
        <Component {...props} />
        <div className="interactions">
            {props.isLoading && <span>Loading...</span>}
        </div>
    </Fragment>

const withPaginated = (Component) => (props) =>
    <Fragment>
        <Component {...props} />
        <div className="interactions">
            {
                (props.page !== null && !props.isLoading) &&
                <button type="button" onClick={props.onPaginatedSearch}>More</button>
            }
        </div>
    </Fragment>

const List = ({ list }) =>
    <div className="list">
        {list.map(item => <div className="list-row" key={item.objectID}>
            <a href={item.url}>{item.title}</a>
        </div>)}
    </div>

const ListWithLoadingWithPaginated = compose(
    withPaginated,
    withLoading,
)(List);