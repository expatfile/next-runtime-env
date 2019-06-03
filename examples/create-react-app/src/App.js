import React from "react";
import env from "@beam-australia/react-env";

const styles = {
  padding: 30,
  margin: 30,
  backgroundColor: "rgba(238, 238, 238, 0.39)",
  fontFamily: "monospace"
};

export default class extends React.Component {
  state = {
    todos: []
  };

  async componentDidMount() {
    const response = await fetch(`${env("API_HOST")}/todos`);
    const todos = await response.json();
    this.setState({ todos });
  }

  render() {
    return (
      <div style={{ width: 650, margin: "0 auto" }}>
        <h1>React Env - {env("FRAMEWORK")}</h1>
        <p>Runtime environment variables</p>
        <hr />
        <h3>Environment</h3>
        <div style={styles}>
          <pre>{JSON.stringify(env(), null, 2)}</pre>
        </div>
        <hr />
        <h3>Todos</h3>
        <ul>
          {this.state.todos.slice(0, 5).map(todo => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      </div>
    );
  }
}
