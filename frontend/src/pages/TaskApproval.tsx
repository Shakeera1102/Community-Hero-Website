import { useEffect, useState } from "react";
import { api } from "../api";

export default function TaskApproval() {

    const [items, setItems] = useState<any[]>([]);

    async function load() {

        try {

            const res = await api.get("/api/maintenance/pending-submissions");

            console.log(res);

            setItems(res);

        } catch (err) {

            console.error(err);

        }

    }

    useEffect(() => {

        load();

    }, []);

    async function approve(id:number){

        await api.post(`/api/maintenance/approve/${id}`);

        load();

    }

    async function reject(id:number){

        await api.post(`/api/maintenance/reject/${id}`);

        load();

    }

    return (

        <div className="container">

            <h1>Pending Maintenance Approval</h1>

            {

                items.length===0 ?

                <h3>No Pending Submissions</h3>

                :

                items.map(item=>(

                    <div
                        key={item.id}
                        className="card"
                    >

                        <h3>{item.task_title}</h3>

                        <p>

                            Worker : {item.worker_name}

                        </p>

                        <p>{item.remarks}</p>

                        <div style={{display:"flex",gap:30}}>

                            <div>

                                <p>Before</p>

                                <img
                                    src={api.asset(`/uploads/${item.before_photo}`)}
                                    width={250}
                                />

                            </div>

                            <div>

                                <p>After</p>

                                <img
                                    src={api.asset(`/uploads/${item.after_photo}`)}
                                    width={250}
                                />

                            </div>

                        </div>

                        <br/>

                        <button
                            className="btn"
                            onClick={()=>approve(item.id)}
                        >
                            Approve
                        </button>

                        <button
                            className="btn danger"
                            onClick={()=>reject(item.id)}
                            style={{marginLeft:20}}
                        >
                            Reject
                        </button>

                    </div>

                ))

            }

        </div>

    );

}