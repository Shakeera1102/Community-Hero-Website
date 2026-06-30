import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";


export default function MyMaintenance() {

    const [tasks, setTasks] = useState<any[]>([]);
    const navigate = useNavigate();

    const load = () => {

        api
            .get("/api/maintenance/my-tasks")
            .then(setTasks)
            .catch(console.log);

    }

    useEffect(() => {

        load();

    }, []);

    return (

        <div className="container">

            <h2>

                My Maintenance Tasks

            </h2>

            <div className="grid cols-3">

                {

                    tasks.map(task => (

                        <div
                            key={task.id}
                            className="card"
                        >

                            <h3>

                                {task.title}

                            </h3>

                            <p>

                                {task.description}

                            </p>

                            <div className="muted">

                                Squad :
                                {" "}
                                {task.squad_name}

                            </div>

                            <div className="muted">

                                Location :
                                {" "}
                                {task.location}

                            </div>

                            <div className="muted">

                                Due :
                                {" "}
                                {task.due_date}

                            </div>

                            <div
                                className="badge"
                                style={{
                                    marginTop: 10
                                }}
                            >

                                {task.status}

                            </div>

                            <button
                                className="btn"
                                onClick={() => navigate(`/maintenance/submit/${task.id}`)}
                            >
                                Start Work
                            </button>
                        </div>

                    ))

                }

            </div>

        </div>

    );

}