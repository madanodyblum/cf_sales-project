import React, {Component} from 'react'
import { connect } from 'react-redux';
import $ from 'jquery';
import { BallBeat } from 'react-pure-loaders';
import { Button, Form, Row } from 'react-bootstrap';
import  Taskform  from './taskform'
import { trls } from '../../components/translate';
import 'datatables.net';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import Updatetask from './updatetask.js'
import Taskhistory from './taskhistory.js'
import Taskdocument from './taskdocument'
import * as Auth from '../../components/auth'
import SweetAlert from 'sweetalert';

const mapStateToProps = state => ({
     ...state.auth,
});

const mapDispatchToProps = dispatch => ({

}); 
class Tasks extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            loading:true,
            tasksData:[],
            currentDate: new Date(),
            search_flag: true,
            arrayFilename: []
        };
      }
componentDidMount() {
    this.setState({search_flag: true})
    this.getTasksData();
}

getTasksData = () => {
    this.setState({loading:true})
    var header = SessionManager.shared().getAuthorizationHeader();
    Axios.get(API.GetTasksData, header)
    .then(result => {
        this.setState({tasksData:result.data.Items})
        this.setState({loading:false})
            if(this.state.search_flag){
                $('#example thead tr').clone(true).appendTo( '#example thead' );
                $('#example thead tr:eq(1)').css("display","contents")
                $('#example thead tr:eq(2)').css("display","none")
                $('#example thead tr:eq(1) th').each( function (i) {
                    var title = $(this).text();
                    var id = $(this).attr('id')
                    $(this).removeAttr('class');
                    if(id==="Status" || id==="Employee" || id==="CreateBy" || id==="Task_Type"){
                        $(this).html( '<input type="text" style="width:100%" placeholder="'+title+'" />' );
                    }
                    else{
                        $(this).html( '<div />' );
                    }
                    $( 'input', this ).on( 'keyup change', function () {
                        if ( table.column(i).search() !== this.value ) {
                            table
                                .column(i)
                                .search( this.value )
                                .draw();
                        }
                    } );
                } );
            }
        this.setState({search_flag: false})
        $('#example').dataTable().fnDestroy();
        var table = $('#example').DataTable(
            {
                orderCellsTop: true,
                fixedHeader: true,
                "language": {
                    "lengthMenu": trls("Show")+" _MENU_ "+trls("Entries"),
                    "zeroRecords": "Nothing found - sorry",
                    "info": trls("Show_page")+" _PAGE_ of _PAGES_",
                    "infoEmpty": "No records available",
                    "infoFiltered": "(filtered from _MAX_ total records)",
                    "search": trls('Search'),
                    "paginate": {
                        "previous": trls('Previous'),
                        "next": trls('Next')
                    },
                }
                }
          );
    });
}

formatDate = (startdate) =>{
        
    var dd = new Date(startdate).getDate();
    var mm = new Date(startdate).getMonth()+1; 
    var yyyy = new Date(startdate).getFullYear();
    var formatDate = '';
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    } 
    formatDate = yyyy+'-'+mm+'-'+dd;
    return formatDate;
}
componentWillUnmount() {
}

taskUpdate = (event) => {
        
    this._isMounted = true;
    let taskid=event.currentTarget.id;
    let params = {
        taskid:taskid
    }
    var headers = SessionManager.shared().getAuthorizationHeader();
    Axios.post(API.GetTask, params, headers)
    .then(result => {
        if(this._isMounted){    
            this.setState({updateTask: result.data.Items})
            this.setState({modalupdateShow:true, taskId: taskid})
        }
    });
}

viewHistory = (event) => {
    this._isMounted = true;
    let taskid=event.currentTarget.id;
    let params = {
        taskid:taskid
    }
    var headers = SessionManager.shared().getAuthorizationHeader();
    Axios.post(API.GetTaskHistory, params, headers)
    .then(result => {
        if(this._isMounted){    
            this.setState({modalViewShow: true})
            this.setState({viewHistoryData: result.data.Items})
        }
    });
}

detailmode = () =>{
    this.setState({taskId: ""})
    this.setState({taskflag: false})
}

openUploadFile = (e) =>{
    this.setState({attachtaskId:e.currentTarget.id});
    $('#inputFile').show();
    $('#inputFile').focus();
    $('#inputFile').click();
    $('#inputFile').hide();
}

onChangeFileUpload = (e) => {
    let filename = [];
    let arrayFilename = this.state.arrayFilename
    filename.key = this.state.attachtaskId;
    filename.name = "Open";
    arrayFilename.push(filename)
    this.setState({arrayFilename: arrayFilename})
    this.setState({filename: e.target.files[0].name})
    this.setState({file:e.target.files[0]})
    this.fileUpload(e.target.files[0])
    this.setState({uploadflag:1})
}

fileUpload(file){
    var formData = new FormData();
    formData.append('file', file);// file from input
    var headers = {
        "headers": {
            "Authorization": "Bearer "+Auth.getUserToken(),
        }
    }
    Axios.post(API.PostFileUpload, formData, headers)
    .then(result => {
        if(result.data.Id){
            this.postTaskDocuments(result.data.Id);
        }
    })
    .catch(err => {
    });
}

postTaskDocuments = (docuId) => {
    this._isMounted = true;
    let params = {
        taskid: this.state.attachtaskId,
        documentid: docuId
    }
    var headers = SessionManager.shared().getAuthorizationHeader();
    Axios.post(API.PostTaskDocuments, params, headers)
    .then(result => {
        if(this._isMounted){    
            SweetAlert({
                title: trls('Success'),
                icon: "success",
                button: "OK",
              });
        }
    })
    .catch(err => {
        SweetAlert({
            title: trls('Fail'),
            icon: "warning",
            button: "OK",
          });
    });
}

getAttachFileName = (id) =>{
    let tempArray = [];
    let filemane = '';
    tempArray = this.state.arrayFilename;
    tempArray.map((data, index) => {
        if(data.key===String(id)){
            filemane = data.name;
        }
        return tempArray;
    })
    return filemane;
}

getTaskDocuments = (event) =>{
    this._isMounted = true;
    let taskData=event.currentTarget.id;
    let arrayTaskData = [];
    arrayTaskData = taskData.split(',');
    let params = {
        taskid:parseInt(arrayTaskData[0])
    }
    var headers = SessionManager.shared().getAuthorizationHeader();
    Axios.post(API.GetTaskDocuments, params, headers)
    .then(result => {
        if(this._isMounted){    
            this.setState({modaldocumentShow: true})
            this.setState({documentData: result.data.Items})
            this.setState({documentHeader: arrayTaskData})
        }
    });
}

render () {
    let tasksData = this.state.tasksData
    if(tasksData){
        tasksData.sort(function(a, b) {
            return a.id - b.id;
        });
    }
    let currentDate = this.formatDate(this.state.currentDate)
    return (
        <div className="order_div">
            <div className="content__header content__header--with-line">
                <h2 className="title">{trls('Tasks')}</h2>
            </div>
            <div className="orders">
                <div className="orders__filters justify-content-between">
                    <Form inline style={{width:"100%"}}>
                        <Button variant="primary" onClick={()=>this.setState({modalShow:true, taskflag:true})}>{trls('Add_Tasks')}</Button>   
                        <Taskform
                            show={this.state.modalShow}
                            onHide={() => this.setState({modalShow: false})}
                            taskflag={this.state.taskflag}
                            onGetTask={()=> this.getTasksData()}
                            detailmode={this.detailmode}
                        />
                        <Updatetask
                                show={this.state.modalupdateShow}
                                onHide={() => this.setState({modalupdateShow: false})}
                                updateTask={this.state.updateTask}
                                taskId={this.state.taskId}
                                onGetTaskData={()=> this.getTasksData()}
                                detailmode={this.detailmode}
                        /> 
                        <Taskhistory
                            show={this.state.modalViewShow}
                            onHide={() => this.setState({modalViewShow: false})}
                            viewHistoryData = {this.state.viewHistoryData}
                        />
                        <Taskdocument
                            show={this.state.modaldocumentShow}
                            onHide={() => this.setState({modaldocumentShow: false})}
                            documentData = {this.state.documentData}
                            documentHeader = {this.state.documentHeader}
                        />
                    </Form>
                </div>
                <div className="table-responsive">
                    <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                        <thead>
                            <tr>
                                <th>{trls('Id')}</th>
                                <th>{trls('CustomerName')}</th>
                                <th>{trls('DateCreated')}</th>
                                <th>{trls('Deadline')}</th>
                                <th>{trls('Employee')}</th>
                                <th>{trls('Task_Type')}</th>
                                <th>{trls('Subject')}</th>
                                <th>{trls('CreateBy')}</th>
                                <th>{trls('Status')}</th>
                                <th>{trls('Attachment')}</th>
                                <th style={{width:50}}>{trls('Action')}</th>
                            </tr>
                            <tr style={{display:'none'}}>
                                <th id="Id">{trls('Id')}</th>
                                <th id="CustomerName">{trls('CustomerName')}</th>
                                <th id="DateCreated">{trls('DateCreated')}</th>
                                <th id="Deadline">{trls('Deadline')}</th>
                                <th id="Employee">{trls('Employee')}</th>
                                <th id="Task_Type">{trls('Task_Type')}</th>
                                <th id="Subject">{trls('Subject')}</th>
                                <th id="CreateBy">{trls('CreateBy')}</th>
                                <th id="Status">{trls('Status')}</th>
                                <th id="Attachment">{trls('Attachment')}</th>
                                <th id="Action">{trls('Action')}</th>
                            </tr>
                        </thead>
                        {tasksData && !this.state.loading &&(<tbody >
                            {
                                tasksData.map((data,i) =>(
                                <tr className={new Date(currentDate) > new Date(this.formatDate(data.deadline)) ? 'task-table-tr-past' : 'task-table-tr'} id={data.Id} key={i}>
                                    <td>{data.Id}</td>
                                    <td>{data.CustomerName}</td>
                                    <td>{this.formatDate(data.DateCreated)}</td>
                                    <td>{this.formatDate(data.deadline)}</td>
                                    <td>{data.employee}</td>
                                    <td>{data.taskType}</td>
                                    <td>{data.Subject}</td>
                                    <td>{data.createdby}</td>
                                    <td>{data.taskStatus}</td>
                                    <td>
                                        <Row>
                                            <i id={data.Id} className="fas fa-file-upload" style={{fontSize:20, cursor: "pointer", paddingLeft: 10, paddingRight:20}} onClick={this.openUploadFile}></i>
                                            <div id={data.Id+','+data.CustomerName+','+data.employee+','+data.Subject} style={{color:"#000", fontWeight:"bold", cursor: "pointer", textDecoration:"underline"}} onClick={this.getTaskDocuments}>{trls('View')}</div>
                                            <input id="inputFile" type="file"  required accept="*.*" onChange={this.onChangeFileUpload} style={{display: "none"}} />
                                        </Row>
                                    </td>
                                    <td >
                                        <Row style={{justifyContent:"space-between"}}>
                                            <i id={data.Id} className="fas fa-edit" style={{fontSize:20, cursor: "pointer", paddingLeft: 10}} onClick={this.taskUpdate}></i>
                                            <i id={data.Id} className="fa fa-history" style={{fontSize:20, cursor: "pointer", paddingLeft: 10}} onClick={this.viewHistory}></i>
                                        </Row>
                                    </td>
                                </tr>
                            ))
                            }
                        </tbody>)}
                    </table>
                    { this.state.loading&& (
                        <div className="col-md-4 offset-md-4 col-xs-12 loading" style={{textAlign:"center"}}>
                            <BallBeat
                                color={'#222A42'}
                                loading={this.state.loading}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};
}
export default connect(mapStateToProps, mapDispatchToProps)(Tasks);
