import { useEffect, useState } from "react";
import { api } from "../api";

import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";

import { useAuth } from "../auth";


export default function MaintenanceTasks() {

    

    const { user } = useAuth();

    const [tasks, setTasks] = useState<any[]>([]);

    const load = async () => {

        try {

            const data = await api.get(
                "/api/maintenance/tasks"
            );

            setTasks(data);

        } catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        load();

    }, []);

    return (

        <div className="container">

            <h2>
                Routine Maintenance
            </h2>

            <p>
                Daily municipal maintenance activities.
            </p>

            {
                user?.role === "authority" && (

                    <TaskForm
                        onCreated={load}
                    />

                )
            }

            <div
                className="grid cols-3"
                style={{
                    marginTop: 20
                }}
            >

                {

                    tasks.map(task => (

                        <TaskCard
                            key={task.id}
                            task={task}
                        />

                    ))

                }

            </div>

        </div>

    );

}