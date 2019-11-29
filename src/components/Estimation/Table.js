import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ReactDragListView from 'react-drag-listview/lib/index.js';
import { FaEllipsisV } from 'react-icons/fa';
import * as table from '../../constant/estimationTable';
import Tick from './Tick';
import { clone } from '../../utils/cloneObj';
import {
  arrangeRow,
  addRow,
  removeRow,
  editCell,
  toggleTick
} from '../../actions/estimation';
import { keepToggle, closeToggle } from '../../actions/toggleEstimation';

let classNames = require('classnames');
class Table extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddRow = this.handleAddRow.bind(this);
    this.state = {
      parentId: '',
      reset: true
    };
    this.setState = this.setState.bind(this);
  }

  handleAddRow = id => {
    this.props.dispatchAddRow(id);
    this.props.dispatchKeepToggle();
  };
  handleRemoveRow = row => {
    if (window.confirm('Confirm removing row?')) {
      row && this.props.dispatchRemoveRow(row);
    }
    this.props.dispatchKeepToggle();
  };
  componentDidMount() {
    document
      .getElementById('estimationTable')
      .addEventListener('keypress', e => {
        var key = e.which || e.keyCode;
        if (key === 13) {
          const id = e.target.getAttribute('id').split('-')[1];
          this.handleAddRow(id);
        }
      });
  }
  onDragEnd = (fromIndex, toIndex) => {
    const data = clone(this.props.estimation);
    const item1 = clone(data[fromIndex]);
    const item2 = clone(data[toIndex]);
    data[fromIndex] = item2;
    data[toIndex] = item1;
    this.props.dispatchArrangeRow(data);
    this.props.dispatchKeepToggle();
  };

  dragProps = {
    onDragEnd: this.onDragEnd,
    nodeSelector: 'li',
    handleSelector: 'a'
  };
  handleInputChange = e => {
    const { id, name, value } = e.target;
    const prefix = id.split('-')[0];
    const cellId = id.replace(`${prefix}-`, '');
    this.props.dispatchEditCell(cellId, name, value);
    this.props.dispatchKeepToggle();
  };
  handleToggleTick = (id, activated) => {
    if (activated) {
      if (
        window.confirm(
          'Are you sure you want to unlink this data row from sitemap?'
        )
      ) {
        this.props.dispatchToggleTick(id);
      }
    } else {
      this.props.dispatchToggleTick(id);
    }
    this.props.dispatchKeepToggle();
  };

  render() {
    return (
      <div id="estimationTable" className="w-full">
        <ReactDragListView {...this.dragProps}>
          <div className="w-full flex items-center h-16">
            {table.head.map((h, key) => (
              <div
                className={classNames([
                  `w-1/${table.head.length}`,
                  'primary-grey font-semibold ml-4 text-white'
                ])}
                key={key}
              >
                {h.name}
              </div>
            ))}
          </div>
          <ol className="w-full">
            {this.props.estimation.map((item, index) => (
              <li className="text-white flex estimation-row h-16" key={index}>
                <div className="flex items-center w-1/4 border grey-border">
                  <a
                    className="-ml-3 mr-3 cursor-pointer absolute z-50"
                    onClick={() => this.handleRemoveRow(item)}
                  >
                    <div className="bg-red-700 rounded-full w-6 h-6 text-white text-xl flex justify-center items-center">
                      -
                    </div>
                  </a>
                  <input
                    autocomplete="off"
                    onChange={e => this.handleInputChange(e)}
                    name="title"
                    id={`title-${item.id}`}
                    className="ml-3 w-full h-full h-full estimation-panel focus:outline-none"
                    type="text"
                    placeholder={item.title}
                  ></input>
                  <div
                    id={`tick-${item.id}`}
                    className="cursor-pointer "
                    onClick={() =>
                      this.handleToggleTick(item.id, item.activated)
                    }
                  >
                    <Tick
                      activated={item.activated}
                      index={index}
                      color={item.color}
                    />
                  </div>
                </div>
                <div className="w-1/4 border grey-border">
                  <input
                    autocomplete="off"
                    id={`rate-${item.id}`}
                    onChange={e => this.handleInputChange(e)}
                    name="rate"
                    className="ml-3 w-full h-full bg-transparent focus:outline-none focus:bg"
                    type="text"
                    placeholder={`$${item.rate}`}
                  />
                </div>
                <div className="w-1/4 border grey-border">
                  <input
                    autocomplete="off"
                    id={`hours-${item.id}`}
                    onChange={e => this.handleInputChange(e)}
                    name="hours"
                    className="ml-3 w-full h-full bg-transparent focus:outline-none focus:bg"
                    type="text"
                    placeholder={item.hours}
                  />
                </div>
                <div className="w-1/4 border grey-border flex justify-between items-center">
                  <input
                    autocomplete="off"
                    id={`amount-${item.id}`}
                    onChange={e => this.handleInputChange(e)}
                    name="amount"
                    className="ml-3 w-full h-full bg-transparent focus:outline-none focus:bg"
                    type="text"
                    placeholder={item.amount}
                  />
                  <a className="active:cursor-grabbing">
                    <FaEllipsisV />
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </ReactDragListView>
        <div
          onClick={() => {
            this.handleAddRow();
          }}
          className="primary-grey h-16 flex justify-start items-center border-b grey-border cursor-pointer"
        >
          Add row
        </div>
      </div>
    );
  }
}
const mapDispatchToProps = dispatch => ({
  dispatchArrangeRow: data => {
    dispatch(arrangeRow(data));
  },
  dispatchAddRow: id => {
    dispatch(addRow(id));
  },
  dispatchRemoveRow: row => {
    dispatch(removeRow(row));
  },
  dispatchEditCell: (cellId, name, value) => {
    dispatch(editCell(cellId, name, value));
  },
  dispatchToggleTick: cellId => {
    dispatch(toggleTick(cellId));
  },
  dispatchKeepToggle: () => {
    dispatch(keepToggle());
  },
  dispatchCloseToggle: () => {
    dispatch(closeToggle());
  }
});
const mapStateToProps = state => {
  const { estimation } = state;
  return { estimation };
};

export default connect(mapStateToProps, mapDispatchToProps)(Table);
