import React, { Component } from 'react';
import axios from 'axios';
import './AddIndex.css';

export default class AddIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spreadArray: [],
            spreadId: ''
        }
    }

    getSpreadsheet = id => {

        // Access current titleArray, sheetArray, and spreadArray.
        const { spreadArray } = this.state;
        const sheetArray = [];
        // Create copies of all state arrays.
        var newDataArray = spreadArray;
        // Bind this as self.
        const self = this;
        // Temporary access token.
        const accessToken = 'ya29.Il-0B8rSJrkaAruZrNqSCJ08F0QYCW_CAg_rDljj76VcK5KVD9GSOWwj-BtOJFj9tJ65Ug9uBjAJsOLGSE7bQxvW_DRLmXVcrSpHE5CcEKW7x1XsXVG2UVifUtMLwxW-lg';

        axios({

            method: 'GET',
            url: `https://sheets.googleapis.com/v4/spreadsheets/${id}`,
            headers: { Authorization: `Bearer ${accessToken}` }

        }).then((response) => {
            console.log(response);
            // For each sheet in the response call getValues with arguments of spreadsheetID, sheet title, and access token.
            for (var index = 0; index < response.data.sheets.length; index++ ) {
                const sheet = response.data.sheets[index], title = sheet.properties.title, metaArray = [], personArray = [];

                axios({

                    method: 'GET',
                    url: `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${title}`,
                    headers: { Authorization: `Bearer ${accessToken}` }

                }).then((response) => {
                    console.log(response);

                    // Iterate through array of rows 2 - 10.
                    for (let i = 1; i < 9; i++) {
                        let metaData = response.data.values[i];
                        if (metaData.length !== 0) {
                            // Assign values to metaObject with metaData values.
                            const metaObject = {
                                line: self.checkValue(metaData[0]),
                                number: self.checkValue(metaData[1])
                            }
                            // Push metaObject to metaArray.
                            metaArray.push(metaObject);
                        }
                    }
                    // Iterate through array of rows 12 - array length.
                    for (let i = 11; i < response.data.values.length; i++) {
                        let personData = response.data.values[i];
                        // Assign values to personObject with personData values.
                        const personObject = {
                            phoneTag: self.checkValue(personData[0]),
                            name: self.checkValue(personData[1]),
                            room: self.checkValue(personData[2]),
                            extension: self.checkValue(personData[3]),
                            phoneNumber: self.checkValue(personData[4]),
                            note: self.checkValue(personData[5])
                        }
                        // Push personObject to personArray for every row.
                        personArray.push(personObject);
                    }
                    // Push sheet's title, metaArray and personArray as an object into sheetArray.
                    sheetArray.push({
                        title: title,
                        value: {
                            metaData: metaArray,
                            personData: personArray
                        }
                    });
                    
                }).catch((error) => {
                    console.log(error);
                });
            }
            // Create variable getObject to store spreadsheet data.
            var spreadObject = {
                spreadsheetId: id,
                spreadsheetTitle: response.data.properties.title,
                sheet: sheetArray
            };
            // Push getObject to newDataArray.
            newDataArray.push(spreadObject);
            // Update spreadTitleArray with newDataArray.
            self.setState({ 
                spreadArray: newDataArray
            });

        }).catch((error) => {
            alert(`Error: SpreadsheetID: ${id} not found.`);
            console.log(error);
        });
    }

    checkValue = (value) => {

        // If row has a value.
        if (value === undefined || value === "") {
            return null
        } else {
            return value.trim();
        }
    }

    postArray = array => {
        console.log(array);

        // Access current dbArray.
        const { dbData } = this.props;
        // For each spreadsheet object inside the array.
        array.forEach(spread => {
            // Create an id.
            let idToBeAdded = 0;
            // Map the current dbArray for existing ids.
            let currentIds = dbData.map(data => data.id);
            // While the created id is equal to an existing id, increment the id.
            while (currentIds.includes(idToBeAdded)) {
                idToBeAdded++;
            }
            // Axios request to post the new id number and data from spreadsheet object.

            axios({

                url: 'http://localhost:3001/api/postData',
                method: 'POST',
                data: {
                    id: idToBeAdded,
                    spreadsheetId: spread.spreadsheetId,
                    spreadsheetTitle: spread.spreadsheetTitle,
                    sheet: spread.sheet
                }

            }).then((reponse) => {
                console.log(reponse);
                this.setState({
                    spreadArray: []
                })
            }).catch((error) => {
                console.log(error);
            });
        });
    }

    addToArray(id) {

        // Access current spreadArray.
        const { spreadArray } = this.state;
        // Access current dbArray.
        const { dbData } = this.props;
        // Create boolean to state if id exist.
        let idNotExist = true, idTitle = '';
        // Create function to check if id exist in dbData.
        dbData.forEach(data => {
            if (id === data.spreadsheetId) {
                idNotExist = false;
                idTitle = data.spreadsheetTitle;
            }
        });
        spreadArray.forEach(data => {
            if (id === data.spreadsheetId) {
                idNotExist = false;
                idTitle = data.spreadsheetTitle;
            }
        });
        // If id has a value and checkDB returns true, call getData else return.
        if (idNotExist) {
            this.getSpreadsheet(id);
        } else return alert(`Error: "${idTitle}" is already added to CyberDex.`);
    }

    removeFromArray(i) {

        // Access current spreadArray.
        const { spreadArray } = this.state;
        // Make a copy of array.
        const newDataArray = spreadArray;
        // Splice from the index of the mapped key.
        newDataArray.splice(i, 1);
        // Set New array as the state.
        this.setState({ spreadArray: newDataArray});
    }

    displayArray = () => {

        // Access current spreadArray.
        const { spreadArray } = this.state;
        // If spreadArray has any values map spreadArray else return.
        if (spreadArray) {
            // Iterate through array.
            return spreadArray.map((data, i) => (
                <li key={i}>
                    {/* Button to remove listed item from Array */}
                    <button onClick={() => this.removeFromArray(i)}>X</button>
                    {/* Display data from each event */}
                    <h3>{data.spreadsheetTitle}</h3>
                </li>
            ));
        } else return
    }

    render() {

        // Access current spreadId and spreadArray.
        const { spreadId, spreadArray } = this.state;
        // Access getDataFromDB function to keep current dbData fresh.
        const { getDataFromDB } = this.props;
        
        return(
            <div className='Index'>
                <label className='Index-addLabel'>Google Sheet:</label>
                <input 
                    id='Index-addText'
                    type='text'
                    placeholder='Enter Spreadsheet-ID'
                    value={spreadId}
                    onChange={event => {
                        this.setState({ spreadId: event.target.value });
                    }}
                    onKeyPress={event => {
                        if(event.key === 'Enter') {
                            getDataFromDB();
                            this.addToArray(spreadId);
                            this.setState({ spreadId: '' });
                        }
                    }}
                />
                <button
                    className='Index-addBtn'
                    onClick={() => {
                        getDataFromDB();
                        this.addToArray(spreadId);
                        this.setState({ spreadId: '' });
                    }}
                >Add</button>
                <br />
                <small><em>For Example: https://docs.google.com/spreadsheets/d/<b>Spreadsheet-ID</b>/edit#gid=0</em></small>
                <ol>
                    {this.displayArray()}
                </ol>
                <button
                    onClick={() => this.postArray(spreadArray)}
                >Submit</button>
            </div>
        );
    }
}