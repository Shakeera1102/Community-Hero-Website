import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function TaskSubmission() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [beforeImage, setBeforeImage] = useState<File | null>(null);
    const [afterImage, setAfterImage] = useState<File | null>(null);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (loading) return;

        setLoading(true);

        try {

            const fd = new FormData();

            fd.append("remarks", remarks);

            if (beforeImage)
                fd.append("before_image", beforeImage);

            if (afterImage)
                fd.append("after_image", afterImage);

            await api.postForm(
                `/api/maintenance/submit/${id}`,
                fd
            );

            alert("Maintenance submitted successfully.");

            navigate("/maintenance/my");

        } finally {

            setLoading(false);

        }

    }

    return (

        <div className="container">

            <h2>Submit Maintenance Work</h2>

            <form
                className="card"
                onSubmit={submit}
            >

                <label>Before Photo</label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setBeforeImage(
                            e.target.files?.[0] || null
                        )
                    }
                    required
                />

                <br /><br />

                <label>After Photo</label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setAfterImage(
                            e.target.files?.[0] || null
                        )
                    }
                    required
                />

                <br /><br />

                <label>Remarks</label>

                <textarea
                    rows={5}
                    value={remarks}
                    onChange={(e) =>
                        setRemarks(e.target.value)
                    }
                />

                <br /><br />

                <button
                    className="btn"
                    disabled={loading}
                >

                    {loading ? "Submitting..." : "Submit Work"}

                </button>

            </form>

        </div>

    );

}