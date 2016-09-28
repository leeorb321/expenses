import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import logo from './logo.svg';
import $ from 'jquery';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

const retrieveDataAPI = 'retrieve_data'

var ViewExpenses = React.createClass({
  getInitialState: function() {
    return {
      categories: [],
      data: [],
      persons: []
    }
  },

  componentDidMount: function() {
    $.ajax({
        url: retrieveDataAPI,
        dataType: 'json',
        cache: false,
        success: function(resData) {
            this.setState({
              categories: resData.categories,
              data: resData.data,
              persons: resData.persons
            });
        }.bind(this),
        error: function(xhr, status, err) {
            //console.error(this.props.niceties, status, err.toString());
        }.bind(this)
    });
  },

  render: function() {
    const tableData = this.state.data.map((dataPoint) => {
      return {
        id: dataPoint.id,
        date: dataPoint.date,
        amount: dataPoint.amount,
        category: dataPoint.category,
        person: dataPoint.person,
        description: dataPoint.description
      }
    });

    const editObject = {
      mode: 'click',
      blurToSave: true
    }
    const tableOptions = {
      clearSearch: true,
      paginationSize: 25
    }
    return (
      <BootstrapTable data={tableData} striped={true} hover={true} search={true} cellEdit={editObject} columnFilter={true} pagination={true} options={tableOptions}>
        <TableHeaderColumn dataField="id" isKey={true} dataAlign="center" dataSort={true} editable={false}>ID</TableHeaderColumn>
        <TableHeaderColumn dataField="date" dataSort={true}>Date</TableHeaderColumn>
        <TableHeaderColumn dataField="amount" dataSort={true}>Amount</TableHeaderColumn>
        <TableHeaderColumn dataField="category" dataSort={true}>Category</TableHeaderColumn>
        <TableHeaderColumn dataField="person" dataSort={true}>Person</TableHeaderColumn>
        <TableHeaderColumn dataField="description">Description</TableHeaderColumn>
      </BootstrapTable>
    );
  }
});

class App extends Component {
  render() {
    return (
      <div className="App">
        <ViewExpenses />
      </div>
    );
  }
}

export default App;