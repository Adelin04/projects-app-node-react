import React from "react";

import "./Projects.css";
import NavBar from "../Nav/NavBar";
import Button from "../_Utils/Button";

import { URL_HEROKU } from "../_Utils/Dependency";
import { Redirect } from "react-router-dom";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EDIT_DONE, REMOVE_PROJECT } from "../Reducer/Action";
import { ProjectsContext } from "../Context/ProjectsContext";

let links = [
  { url: "/", link: "Home" },
  { url: "/dashboard", link: "Dashboard" },
];

class EditProject extends React.Component {
  static contextType = ProjectsContext;
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      projectName: "",
      projectTime: "",
      projectDetails: "",
      projectTeam: [],
      usersList: [],
      editID: "",
      redirect: false,
      visibility: "hidden",
      btnMsg: "Done"
    };
  }

  setRedirect = () => {
    this.setState({
      redirect: true
    });
  };

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={"/dashboard"} />;
    }
  };

  loadUsers = () => {
    fetch(`${URL_HEROKU}get/list-user`)
      .then(res => {
        return res.json();
      })
      .then(data => {
        /* console.log("users ->", data.users); */
        this.setState({ usersList: data.users });
      });
  };

  componentDidMount() {
    const { match: { params } } = this.props;

    this.context.dispatch({
      type: REMOVE_PROJECT,
      payload: [
        ...this.context.projects.projects.filter(
          project => project.projectID !== Number(params.id)
        )
      ]
    });
    fetch(`${URL_HEROKU}get/project/${params.id}`)
      .then(Response => Response.json())
      .then(data => {
        this.setState({
          projectName: data.project.projectName,
          projectTeam: data.project.projectTeam,
          projectTime: data.project.projectTime,
          projectDetails: data.project.projectDetails
        });
      });
    this.loadUsers();
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    let self = this;
    const { match: { params } } = this.props;

    const dataEditProject = {
      projectName: self.state.projectName,
      projectTeam: self.state.projectTeam.toString(),
      projectTime: self.state.projectTime,
      projectDetails: self.state.projectDetails
    };

    fetch(`${URL_HEROKU}edit/project/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataEditProject)
    })
      .then(response => response.json())
      .then(data => {
        if (data.succes) {
          this.context.dispatch({
            type: EDIT_DONE,
            payload: [...this.context.projects.projects, data.updatedProject]
          });
        }
        console.log("data submited -> ", data);
      })
      .catch(err => console.log(err));

    self.setState({
      btnMsg: "Loading...",
      projectName: "",
      projectTime: "",
      projectDetails: "",
      projectTeam: [],
      usersList: []
    });

    this.setRedirect();
  };

  handleChangeAddUser = event => {
    //console.log(event.target.id);
    //console.log(event.target.value);

    let usersProject = this.state.projectTeam.toString();
    let TMP_list = [];
    if (event.target.checked) {
      TMP_list.push(...this.state.projectTeam, event.target.value);
      this.setState({
        [event.target.name]: TMP_list
      });
      console.log("TMP_list in if ->", TMP_list);
    } else if (!event.target.checked) {
      let remainingItems = usersProject
        .split(",")
        .filter(element => element !== event.target.value);
      this.setState({
        [event.target.name]: remainingItems
      });
    }
    console.log("TMP_list in else if ->", TMP_list);
  };

  handleGetUsers = e => {
    e.preventDefault();

    this.state.visibility === "hidden"
      ? this.setState({ visibility: "visible" })
      : this.setState({ visibility: "hidden" });
  };

  render() {
    console.log("this.context", this.context);
    let isChecked = false;
    const listUsers = [];
    const projectTeam = this.state.projectTeam;

    this.state.usersList.forEach((element, id) => {
      if (projectTeam.includes(element)) {
        isChecked = true;
      } else {
        isChecked = false;
      }
      listUsers.push(
        <li key={id}>
          <input
            className="input-listUsers"
            type="checkbox"
            checked={isChecked}
            name="projectTeam"
            id={id}
            onChange={this.handleChangeAddUser}
            value={element}
          />
          {element}
          {/*  {console.log(element)} */}
        </li>
      );
    });

    let listStyle = { visibility: this.state.visibility };
    return (
      <div className="projects">
        {this.renderRedirect()}
        <NavBar links={links} />

        <div className="wrapper-form">
          <ul style={listStyle} className="userListStyle-ul">
            {listUsers}
          </ul>

          <form
            className="form-content"
            method="POST"
            onSubmit={this.handleSubmit}
          >
            <label htmlFor="projectName">Project Name</label>
            <input
              className="input-dataUser"
              onChange={this.handleChange}
              value={this.state.projectName}
              autoFocus={true}
              required
              type="text"
              id="projectName"
            />

            <label htmlFor="projectTeam">Project Time</label>
            <input
              className="input-dataUser"
              onChange={this.handleChange}
              value={this.state.projectTime}
              required
              type="text"
              id="projectTime"
            />

            <label htmlFor="projectTeam">Project Team</label>
            <FontAwesomeIcon
              icon={faUserPlus}
              className="logoAddUser"
              onClick={this.handleGetUsers}
            />

            <textarea
              className="user-list"
              onChange={this.handleChangeAddUser}
              value={this.state.projectTeam}
              required
              type="text"
              id="projectTeam"
            />

            <label htmlFor="projectDetails">Project Details</label>
            <textarea
              className="area-projectDetails"
              onChange={this.handleChange}
              value={this.state.projectDetails}
              required
              rows="10"
              type="text"
              id="projectDetails"
            />

            <Button textBtn={this.state.btnMsg} />
          </form>
        </div>
      </div>
    );
  }
}

export default EditProject;