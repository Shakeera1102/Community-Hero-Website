// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { api } from "../api";
// import { useAuth } from "../auth";

// export default function IssueDetail() {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const [data, setData] = useState<any>(null);
//   const [err, setErr] = useState("");
//   const [resolveFile, setResolveFile] = useState<File | null>(null);
//   const [progressFile, setProgressFile] = useState<File | null>(null);
//   const [description, setDescription] = useState("");
//   const [progress, setProgress] = useState(0);
//   const [verdict, setVerdict] = useState<any>(null);
//   const [contractors, setContractors] = useState<any[]>([]);
//   const [selectedContractor, setSelectedContractor] = useState("");
//   const [uploadingProgress, setUploadingProgress] = useState(false);

//   const [submittingResolution, setSubmittingResolution] = useState(false);

//   const [startingWork, setStartingWork] = useState(false);

//   const [approvingWork, setApprovingWork] = useState(false);

//   const [rejectingWork, setRejectingWork] = useState(false);

//   const load = () => api.get(`/api/issues/${id}`).then(setData).catch(e => setErr(e.message));
//   useEffect(() => {
//     load();

//     if (user?.role === "authority") {
//       api.get("/api/contractors")
//         .then(setContractors)
//         .catch(() => { });
//     }

//   }, [id]);

//   const upvote = async () => { try { await api.post(`/api/issues/${id}/upvote`); load(); } catch (e: any) { setErr(e.message); } };
//   const verify = async () => { try { const fd = new FormData(); fd.append("note", ""); await api.postForm(`/api/issues/${id}/verify`, fd); load(); } catch (e: any) { setErr(e.message); } };
//   const resolve = async (e: React.FormEvent) => {

//     e.preventDefault();

//     if (!resolveFile) return;

//     if (submittingResolution) return;

//     const fd = new FormData();

//     fd.append("image", resolveFile);

//     try {

//       setSubmittingResolution(true);

//       const r = await api.postForm(
//         `/api/issues/${id}/resolve`,
//         fd
//       );

//       setVerdict(r);

//       load();

//     }
//     catch (e: any) {

//       setErr(e.message);

//     }
//     finally {

//       setSubmittingResolution(false);

//     }

//   };

//   const uploadProgress = async () => {

//     if (!progressFile) return;

//     if (uploadingProgress) return;

//     const fd = new FormData();

//     fd.append("description", description);

//     fd.append("progress_percent", progress.toString());

//     fd.append("image", progressFile);

//     try {

//       setUploadingProgress(true);

//       await api.postForm(
//         `/api/issues/${id}/progress`,
//         fd
//       );

//       alert("Progress Uploaded");

//       load();

//     }
//     catch (e: any) {

//       setErr(e.message);

//     }
//     finally {

//       setUploadingProgress(false);

//     }

//   }

//   const startWork = async () => {

//     if (startingWork) return;

//     try {

//       setStartingWork(true);

//       await api.post(`/api/issues/${id}/start`);

//       alert("Work Started");

//       load();

//     } catch (e: any) {

//       setErr(e.message);

//     } finally {

//       setStartingWork(false);

//     }
//   };

//   const assign = async () => {

//     if (!selectedContractor) {
//       alert("Please select contractor");
//       return;
//     }

//     const fd = new FormData();

//     fd.append("contractor_id", selectedContractor);

//     try {

//       await api.postForm(
//         `/api/issues/${id}/assign`,
//         fd
//       );

//       alert("Contractor Assigned Successfully");

//       load();

//     } catch (e: any) {

//       setErr(e.message);

//     }

//   };

//   if (err) return <div className="container"><div className="error">{err}</div></div>;
//   if (!data) return <div className="container">Loading…</div>;
//   const i = data.issue;

//   const approveWork = async () => {

//     if (approvingWork) return;

//     try {

//       setApprovingWork(true);

//       await api.post(`/api/issues/${id}/approve`);

//       alert("Issue Approved Successfully");

//       load();

//     }
//     catch (e: any) {

//       setErr(e.message);

//     }
//     finally {

//       setApprovingWork(false);

//     }

//   };

//   const rejectWork = async () => {

//     const reason = prompt("Reason?");

//     if (!reason) return;

//     if (rejectingWork) return;

//     const fd = new FormData();

//     fd.append("reason", reason);

//     try {

//       setRejectingWork(true);

//       await api.postForm(
//         `/api/issues/${id}/reject`,
//         fd
//       );

//       alert("Rejected");

//       load();

//     }
//     catch (e: any) {

//       setErr(e.message);

//     }
//     finally {

//       setRejectingWork(false);

//     }

//   };
//   return (
//     <div className="container" style={{ maxWidth: 900 }}>
//       <h2>{i.title}</h2>
//       <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//         <span className={`badge ${i.severity}`}>{i.severity}</span>
//         <span className={`badge ${i.status}`}>{i.status}</span>
//         <span className="badge">{i.category}</span>
//       </div>

//       <div className="issue-top">
//         <div>
//           {i.image_url && <img src={api.asset(i.image_url)} style={{ width: "100%", borderRadius: 12 }} alt="" />}
//           <div className="card" style={{ marginTop: 12 }}>
//             <p>{i.description || <em className="muted">No description</em>}</p>
//             <div className="muted" style={{ fontSize: 13 }}>
//               Ward: {i.ward || "—"} · Dept: {i.department} · 👍 {i.upvotes}<br />
//               📍 {i.lat?.toFixed?.(4)}, {i.lng?.toFixed?.(4)}<br />
//               Reported: {i.created_at}
//             </div>
//           </div>
//         </div>
//         <div>
//           {i.resolution_image_url && (
//             <div className="card success-msg" style={{ padding: 12 }}>
//               <strong>✅ After</strong>
//               <img src={api.asset(i.resolution_image_url)} style={{ width: "100%", borderRadius: 8, marginTop: 8 }} alt="" />
//             </div>
//           )}
//           {user && (
//             <div className="card">
//               <h3>Actions</h3>
//               {
//                 user.role === "authority" &&
//                 i.status === "verified" && (

//                   <div style={{ marginBottom: 20 }}>

//                     <label>Select Contractor</label>

//                     <select
//                       value={selectedContractor}
//                       onChange={(e) => setSelectedContractor(e.target.value)}
//                     >

//                       <option value="">Choose Contractor</option>

//                       {
//                         contractors.map((c: any) => (
//                           <option key={c.id} value={c.id}>
//                             {c.name}
//                           </option>
//                         ))
//                       }

//                     </select>

//                     <button
//                       className="btn"
//                       style={{ marginTop: 10 }}
//                       onClick={assign}
//                     >

//                       Assign Contractor

//                     </button>

//                   </div>

//                 )
//               }
//               <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                 <button className="btn ghost" onClick={upvote}>👍 Upvote</button>
//                 <button className="btn ghost" onClick={verify}>✅ Verify</button>
//               </div>
//               {
//                 user.role === "contractor" && (

//                   <div style={{ marginTop: 20 }}>

//                     {i.status === "assigned" && (

//                       <button
//                         className="btn"
//                         onClick={startWork}
//                         disabled={startingWork}
//                       >

//                         {
//                           startingWork
//                             ? "Starting..."
//                             : "🚧 Start Work"
//                         }

//                       </button>

//                     )}

//                     {i.status === "in_progress" && (

//                       <div style={{ marginTop: 15 }}>

//                         <h3>Today's Progress</h3>

//                         <textarea

//                           placeholder="What work was completed today?"

//                           value={description}

//                           onChange={(e) => setDescription(e.target.value)}

//                         />

//                         <input

//                           type="number"

//                           placeholder="Progress %"

//                           value={progress}

//                           onChange={(e) => setProgress(Number(e.target.value))}

//                         />

//                         <input

//                           type="file"

//                           accept="image/*"

//                           onChange={(e) => setProgressFile(e.target.files?.[0] || null)}

//                         />

//                         <button
//                           className="btn"
//                           onClick={uploadProgress}
//                           disabled={uploadingProgress}
//                         >

//                           {
//                             uploadingProgress
//                               ?
//                               "Uploading..."
//                               :
//                               "📷 Upload Progress"
//                           }

//                         </button>

//                       </div>

//                     )}
//                     {i.status === "in_progress" && (
//                       <form onSubmit={resolve} style={{ marginTop: 20 }}>

//                         <label>Upload AFTER photo (Gemini will verify)</label>

//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={(e) =>
//                             setResolveFile(e.target.files?.[0] || null)
//                           }
//                         />

//                         <button
//                           className="btn"
//                           style={{ marginTop: 10 }}
//                           disabled={submittingResolution}
//                         >

//                           {
//                             submittingResolution
//                               ?
//                               "Uploading..."
//                               :
//                               "Submit Resolution"
//                           }

//                         </button>

//                       </form>

//                     )}
//                   </div>

//                 )
//               }
//               {verdict && (
//                 <div className="success-msg">
//                   <strong>Gemini verdict:</strong>

//                   {verdict.verdict?.explanation}

//                   <br />

//                   Status :
//                   {verdict.status}
//                 </div>
//               )}
//               {
//                 user?.role === "authority"

//                 &&

//                 i.status === "waiting_approval"

//                 &&

//                 (

//                   <div className="card">

//                     <h3>Officer Decision</h3>

//                     <button
//                       className="btn"
//                       onClick={approveWork}
//                       disabled={approvingWork}
//                     >

//                       {
//                         approvingWork
//                           ?
//                           "Approving..."
//                           :
//                           "✅ Approve Work"
//                       }

//                     </button>

//                     <button
//                       className="btn danger"
//                       onClick={rejectWork}
//                       disabled={rejectingWork}
//                     >

//                       {
//                         rejectingWork
//                           ?
//                           "Rejecting..."
//                           :
//                           "❌ Reject Work"
//                       }

//                     </button>

//                   </div>

//                 )
//               }
//             </div>

//           )}
//           <div className="card">
//             <h3>Community Verifications ({data.verifications.length})</h3>
//             <div className="progress-section">

//               <h3 style={{ marginBottom: 25 }}>
//                 📈 Daily Progress Timeline
//               </h3>

//               {(data.updates || []).map((u: any, index: number) => (

//                 <div key={u.id} className="progress-card">

//                   <div className="progress-header">

//                     <span className="progress-step">
//                       Step {index + 1}
//                     </span>

//                     <span className="progress-percent">
//                       {u.progress_percent}%
//                     </span>

//                   </div>

//                   <div className="progress-bar">

//                     <div
//                       className="progress-fill"
//                       style={{
//                         width: `${u.progress_percent}%`
//                       }}
//                     />

//                   </div>

//                   <img
//                     src={api.asset(u.image_url)}
//                     className="progress-image"
//                     alt=""
//                   />

//                   <div className="progress-description">

//                     {u.description}

//                   </div>

//                   <div className="progress-date">

//                     🕒 {u.created_at}

//                   </div>

//                 </div>

//               ))}

//               {(!data.updates || data.updates.length === 0) && (

//                 <div className="empty-progress">

//                   <div className="empty-icon">

//                     📷

//                   </div>

//                   <h4>

//                     No Progress Uploaded Yet

//                   </h4>

//                   <p>

//                     The assigned contractor hasn't uploaded any work updates yet.

//                   </p>

//                 </div>

//               )}

//             </div>
//             {data.verifications.map((v: any) => (
//               <div
//                 key={v.id}
//                 className="verification-item"
//               >

//                 <div>

//                   <strong>

//                     👤 {v.name}

//                   </strong>

//                 </div>

//                 <div className="muted">

//                   🕒 {v.created_at}

//                 </div>

//               </div>
//             ))}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";

export default function IssueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  const [resolveFile, setResolveFile] = useState<File | null>(null);
  const [progressFile, setProgressFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [verdict, setVerdict] = useState<any>(null);
  const [contractors, setContractors] = useState<any[]>([]);
  const [selectedContractor, setSelectedContractor] = useState("");
  const [uploadingProgress, setUploadingProgress] = useState(false);

  const [submittingResolution, setSubmittingResolution] = useState(false);

  const [startingWork, setStartingWork] = useState(false);

  const [approvingWork, setApprovingWork] = useState(false);

  const [rejectingWork, setRejectingWork] = useState(false);

  const load = () => api.get(`/api/issues/${id}`).then(setData).catch(e => setErr(e.message));
  useEffect(() => {
    load();

    if (user?.role === "authority") {
      api.get("/api/contractors")
        .then(setContractors)
        .catch(() => { });
    }

  }, [id]);

  const upvote = async () => { try { await api.post(`/api/issues/${id}/upvote`); load(); } catch (e: any) { setErr(e.message); } };
  const verify = async () => { try { const fd = new FormData(); fd.append("note", ""); await api.postForm(`/api/issues/${id}/verify`, fd); load(); } catch (e: any) { setErr(e.message); } };
  const resolve = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!resolveFile) return;

    if (submittingResolution) return;

    const fd = new FormData();

    fd.append("image", resolveFile);

    try {

      setSubmittingResolution(true);

      const r = await api.postForm(
        `/api/issues/${id}/resolve`,
        fd
      );

      setVerdict(r);

      load();

    }
    catch (e: any) {

      setErr(e.message);

    }
    finally {

      setSubmittingResolution(false);

    }

  };

  const uploadProgress = async () => {

    if (!progressFile) return;

    if (uploadingProgress) return;

    const fd = new FormData();

    fd.append("description", description);

    fd.append("progress_percent", progress.toString());

    fd.append("image", progressFile);

    try {

      setUploadingProgress(true);

      await api.postForm(
        `/api/issues/${id}/progress`,
        fd
      );

      alert("Progress Uploaded");

      load();

    }
    catch (e: any) {

      setErr(e.message);

    }
    finally {

      setUploadingProgress(false);

    }

  }

  const startWork = async () => {

    if (startingWork) return;

    try {

      setStartingWork(true);

      await api.post(`/api/issues/${id}/start`);

      alert("Work Started");

      load();

    } catch (e: any) {

      setErr(e.message);

    } finally {

      setStartingWork(false);

    }
  };

  const assign = async () => {

    if (!selectedContractor) {
      alert("Please select contractor");
      return;
    }

    const fd = new FormData();

    fd.append("contractor_id", selectedContractor);

    try {

      await api.postForm(
        `/api/issues/${id}/assign`,
        fd
      );

      alert("Contractor Assigned Successfully");

      load();

    } catch (e: any) {

      setErr(e.message);

    }

  };

  if (err) return <div className="ch-container"><div className="ch-error">{err}</div><style>{styles}</style></div>;
  if (!data) return <div className="ch-container ch-loading">Loading…<style>{styles}</style></div>;
  const i = data.issue;

  const approveWork = async () => {

    if (approvingWork) return;

    try {

      setApprovingWork(true);

      await api.post(`/api/issues/${id}/approve`);

      alert("Issue Approved Successfully");

      load();

    }
    catch (e: any) {

      setErr(e.message);

    }
    finally {

      setApprovingWork(false);

    }

  };

  const rejectWork = async () => {

    const reason = prompt("Reason?");

    if (!reason) return;

    if (rejectingWork) return;

    const fd = new FormData();

    fd.append("reason", reason);

    try {

      setRejectingWork(true);

      await api.postForm(
        `/api/issues/${id}/reject`,
        fd
      );

      alert("Rejected");

      load();

    }
    catch (e: any) {

      setErr(e.message);

    }
    finally {

      setRejectingWork(false);

    }

  };
  return (
    <div className="ch-container">
      <div className="ch-card ch-header-card">
        <h2 className="ch-title">{i.title}</h2>
        <div className="ch-badges">
          <span className={`ch-badge ch-badge-${i.severity}`}>{i.severity}</span>
          <span className={`ch-badge ch-badge-status`}>{i.status}</span>
          <span className="ch-badge ch-badge-default">{i.category}</span>
        </div>
      </div>

      {/* ---------- Image | Details ---------- */}
      <div className="ch-section-label">Image | Details</div>
      <div className="ch-card">
        <div className="issue-top">
          <div>
            {i.image_url && <img src={api.asset(i.image_url)} className="ch-main-image" alt="" />}
            {i.resolution_image_url && (
              <div className="ch-success-msg" style={{ padding: 12, marginTop: 12, borderRadius: 10 }}>
                <strong>✅ After</strong>
                <img src={api.asset(i.resolution_image_url)} style={{ width: "100%", borderRadius: 8, marginTop: 8 }} alt="" />
              </div>
            )}
          </div>
          <div>
            <p>{i.description || <em className="muted">No description</em>}</p>
            <div className="ch-info-row">
              <span className="ch-info-icon">👤</span>
              <span className="ch-info-label">Ward</span>
              <span className="ch-info-value">{i.ward || "—"}</span>
            </div>
            <div className="ch-info-row">
              <span className="ch-info-icon">🏢</span>
              <span className="ch-info-label">Department</span>
              <span className="ch-info-value">{i.department}</span>
            </div>
            <div className="ch-info-row">
              <span className="ch-info-icon">👍</span>
              <span className="ch-info-label">Upvotes</span>
              <span className="ch-info-value">{i.upvotes}</span>
            </div>
            <div className="ch-info-row">
              <span className="ch-info-icon">📍</span>
              <span className="ch-info-label">Location</span>
              <span className="ch-info-value">{i.lat?.toFixed?.(4)}, {i.lng?.toFixed?.(4)}</span>
            </div>
            <div className="ch-info-row">
              <span className="ch-info-icon">📅</span>
              <span className="ch-info-label">Reported On</span>
              <span className="ch-info-value">{i.created_at}</span>
            </div>
            <div className="ch-quick-actions">
              <button className="ch-btn ch-btn-amber" onClick={upvote}>👍 Upvote</button>
              <button className="ch-btn ch-btn-green" onClick={verify}>✅ Verify</button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Progress Timeline ---------- */}
      <div className="ch-section-label">Progress Timeline</div>
      <div className="ch-card">
        <div className="progress-section">
          <h3 className="ch-section-title">📈 Daily Progress Timeline</h3>

          <div className="ch-timeline">
            {(data.updates || []).map((u: any, index: number) => (

              <div key={u.id} className="ch-timeline-item">
                <div className="ch-timeline-dot">
                  {index === 0 ? "✓" : ""}
                </div>
                {index !== (data.updates.length - 1) && <div className="ch-timeline-line" />}

                <div className="progress-card ch-progress-card">

                  <div className="progress-header">

                    <span className="progress-step ch-step-badge">
                      Step {index + 1}
                    </span>

                    <span className="progress-date ch-step-date">

                      🕒 {u.created_at}

                    </span>

                  </div>

                  <div className="ch-progress-row">
                    <span className="progress-percent ch-percent-text">
                      {u.progress_percent}%
                    </span>

                    <div className="progress-bar ch-progress-bar">

                      <div
                        className="progress-fill ch-progress-fill"
                        style={{
                          width: `${u.progress_percent}%`
                        }}
                      />

                    </div>
                  </div>

                  <img
                    src={api.asset(u.image_url)}
                    className="progress-image ch-progress-image"
                    alt=""
                  />

                  <div className="progress-description ch-progress-desc">

                    {u.description}

                  </div>

                </div>

              </div>

            ))}
          </div>

          {(!data.updates || data.updates.length === 0) && (

            <div className="empty-progress ch-empty-progress">

              <div className="empty-icon">

                📷

              </div>

              <h4>

                No Progress Uploaded Yet

              </h4>

              <p>

                The assigned contractor hasn't uploaded any work updates yet.

              </p>

            </div>

          )}

        </div>
      </div>

      {/* ---------- Community Verification ---------- */}
      <div className="ch-section-label">Community Verification</div>
      <div className="ch-card">
        <h3 className="ch-section-title">Community Verifications ({data.verifications.length})</h3>
        <div className="ch-verifications">
          {data.verifications.map((v: any) => (
            <div
              key={v.id}
              className="verification-item ch-verification-item"
            >

              <div>

                <strong>

                  👤 {v.name}

                </strong>

              </div>

              <div className="muted">

                🕒 {v.created_at}

              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ---------- Officer Actions ---------- */}
      {user && (
        <>
          <div className="ch-section-label">Officer Actions</div>
          <div className="ch-card">
            <h3 className="ch-section-title">Actions</h3>
            {
              user.role === "authority" &&
              i.status === "verified" && (

                <div style={{ marginBottom: 20 }}>

                  <label className="ch-label">Select Contractor</label>

                  <select
                    className="ch-select"
                    value={selectedContractor}
                    onChange={(e) => setSelectedContractor(e.target.value)}
                  >

                    <option value="">Choose Contractor</option>

                    {
                      contractors.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    }

                  </select>

                  <button
                    className="ch-btn ch-btn-primary"
                    style={{ marginTop: 10 }}
                    onClick={assign}
                  >

                    Assign Contractor

                  </button>

                </div>

              )
            }
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="ch-btn ch-btn-ghost" onClick={upvote}>👍 Upvote</button>
              <button className="ch-btn ch-btn-ghost" onClick={verify}>✅ Verify</button>
            </div>
            {
              user.role === "contractor" && (

                <div style={{ marginTop: 20 }}>

                  {i.status === "assigned" && (

                    <button
                      className="ch-btn ch-btn-primary"
                      onClick={startWork}
                      disabled={startingWork}
                    >

                      {
                        startingWork
                          ? "Starting..."
                          : "🚧 Start Work"
                      }

                    </button>

                  )}

                  {i.status === "in_progress" && (

                    <div style={{ marginTop: 15 }}>

                      <h3 className="ch-section-title">Today's Progress</h3>

                      <textarea
                        className="ch-textarea"
                        placeholder="What work was completed today?"

                        value={description}

                        onChange={(e) => setDescription(e.target.value)}

                      />

                      <input
                        className="ch-input"
                        type="number"

                        placeholder="Progress %"

                        value={progress}

                        onChange={(e) => setProgress(Number(e.target.value))}

                      />

                      <input
                        className="ch-file-input"
                        type="file"

                        accept="image/*"

                        onChange={(e) => setProgressFile(e.target.files?.[0] || null)}

                      />

                      <button
                        className="ch-btn ch-btn-primary"
                        onClick={uploadProgress}
                        disabled={uploadingProgress}
                      >

                        {
                          uploadingProgress
                            ?
                            "Uploading..."
                            :
                            "📷 Upload Progress"
                        }

                      </button>

                    </div>

                  )}
                  {i.status === "in_progress" && (
                    <form onSubmit={resolve} className="ch-resolution-form">

                      <label className="ch-label">Upload AFTER photo (Gemini will verify)</label>

                      <input
                        className="ch-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setResolveFile(e.target.files?.[0] || null)
                        }
                      />

                      <button
                        className="ch-btn ch-btn-primary"
                        style={{ marginTop: 10 }}
                        disabled={submittingResolution}
                      >

                        {
                          submittingResolution
                            ?
                            "Uploading..."
                            :
                            "Submit Resolution"
                        }

                      </button>

                    </form>

                  )}
                </div>

              )
            }
            {verdict && (
              <div className="ch-success-msg ch-verdict-box">
                <strong>Gemini verdict:</strong>

                {verdict.verdict?.explanation}

                <br />

                Status :
                {verdict.status}
              </div>
            )}
            {
              user?.role === "authority"

              &&

              i.status === "waiting_approval"

              &&

              (

                <div className="ch-card ch-decision-card">

                  <h3 className="ch-section-title">Officer Decision</h3>

                  <button
                    className="ch-btn ch-btn-primary"
                    onClick={approveWork}
                    disabled={approvingWork}
                  >

                    {
                      approvingWork
                        ?
                        "Approving..."
                        :
                        "✅ Approve Work"
                    }

                  </button>

                  <button
                    className="ch-btn ch-btn-danger"
                    onClick={rejectWork}
                    disabled={rejectingWork}
                  >

                    {
                      rejectingWork
                        ?
                        "Rejecting..."
                        :
                        "❌ Reject Work"
                    }

                  </button>

                </div>

              )
            }
          </div>
        </>
      )}
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .ch-container {
    width: 90%;
    max-width: none;
    margin: 0 auto;
    padding: 24px 16px 60px;
    color: #e6e9f5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-sizing: border-box;
  }
  .ch-loading {
    text-align: center;
    padding-top: 80px;
    color: #9aa3c7;
  }
  .ch-error {
    background: rgba(255, 80, 80, 0.1);
    border: 1px solid rgba(255, 80, 80, 0.4);
    color: #ff8a8a;
    padding: 14px 18px;
    border-radius: 10px;
  }
  .ch-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #8aa0ff;
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 28px 0 10px 0;
  }
  .ch-section-label::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(120,130,200,0.25);
  }
  .ch-card {
    background: rgba(20, 24, 46, 0.85);
    border: 1px solid rgba(120, 130, 200, 0.15);
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 6px;
  }
  .ch-header-card {
    background: rgba(15, 18, 38, 0.9);
  }
  .ch-title {
    margin: 0 0 12px 0;
    font-size: 22px;
    color: #fff;
  }
  .ch-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ch-badge {
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .ch-badge-high { background: rgba(255, 70, 90, 0.18); color: #ff6b7d; border: 1px solid rgba(255,70,90,0.35); }
  .ch-badge-medium { background: rgba(255, 180, 50, 0.18); color: #ffc24d; border: 1px solid rgba(255,180,50,0.35); }
  .ch-badge-low { background: rgba(80, 200, 120, 0.18); color: #66dd95; border: 1px solid rgba(80,200,120,0.35); }
  .ch-badge-status { background: rgba(90, 120, 255, 0.18); color: #8aa0ff; border: 1px solid rgba(90,120,255,0.35); }
  .ch-badge-default { background: rgba(120, 130, 200, 0.15); color: #b8c0e8; border: 1px solid rgba(120,130,200,0.3); }
  .ch-main-image {
    width: 100%;
    border-radius: 14px;
    display: block;
    object-fit: cover;
    max-height: 420px;
  }
  .issue-top {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 24px;
  }
  @media (max-width: 760px) {
    .issue-top { grid-template-columns: 1fr; }
  }
  .ch-info-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(120,130,200,0.1);
    font-size: 14px;
  }
  .ch-info-row:last-child { border-bottom: none; }
  .ch-info-icon { width: 20px; text-align: center; }
  .ch-info-label { color: #9aa3c7; flex: 1; }
  .ch-info-value { color: #c9d0ff; font-weight: 500; }
  .ch-quick-actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }
  .ch-success-msg {
    background: rgba(60, 200, 130, 0.08);
    border: 1px solid rgba(60, 200, 130, 0.3);
    color: #b9f5d4;
  }
  .ch-verdict-box {
    margin-top: 16px;
    border-radius: 10px;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.6;
  }
  .ch-section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #fff;
  }
  .ch-label {
    display: block;
    font-size: 13px;
    color: #9aa3c7;
    margin-bottom: 6px;
  }
  .ch-select, .ch-input, .ch-textarea {
    width: 100%;
    background: rgba(10, 13, 30, 0.8);
    border: 1px solid rgba(120,130,200,0.25);
    color: #e6e9f5;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    margin-bottom: 10px;
    box-sizing: border-box;
  }
  .ch-textarea { min-height: 80px; resize: vertical; }
  .ch-file-input {
    width: 100%;
    color: #c9d0ff;
    font-size: 13px;
    margin-bottom: 10px;
  }
  .ch-resolution-form {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px dashed rgba(120,130,200,0.2);
  }
  .ch-btn {
    border: none;
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .ch-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ch-btn-primary { background: linear-gradient(135deg, #5b6cff, #7b5bff); color: #fff; margin-right: 8px; }
  .ch-btn-amber { background: rgba(255, 180, 50, 0.18); color: #ffc24d; border: 1px solid rgba(255,180,50,0.4); }
  .ch-btn-green { background: rgba(60, 200, 130, 0.18); color: #66dd95; border: 1px solid rgba(60,200,130,0.4); }
  .ch-btn-ghost { background: rgba(120,130,200,0.1); color: #c9d0ff; border: 1px solid rgba(120,130,200,0.25); }
  .ch-btn-danger { background: rgba(255, 70, 90, 0.15); color: #ff7d8c; border: 1px solid rgba(255,70,90,0.35); }
  .ch-decision-card {
    margin-top: 16px;
    background: rgba(255,255,255,0.02);
  }
  .ch-timeline {
    position: relative;
    padding-left: 10px;
  }
  .ch-timeline-item {
    position: relative;
    padding-left: 36px;
    margin-bottom: 22px;
  }
  .ch-timeline-dot {
    position: absolute;
    left: 0;
    top: 0;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(90,120,255,0.15);
    border: 2px solid #5b6cff;
    color: #5b6cff;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ch-timeline-line {
    position: absolute;
    left: 13px;
    top: 26px;
    bottom: -22px;
    width: 2px;
    background: rgba(120,130,200,0.25);
    border-left: 2px dashed rgba(120,130,200,0.3);
  }
  .ch-progress-card {
    background: rgba(10, 13, 30, 0.7);
    border: 1px solid rgba(120,130,200,0.15);
    border-radius: 12px;
    padding: 14px 16px;
  }
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .ch-step-badge {
    background: rgba(90,120,255,0.18);
    color: #8aa0ff;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
  .ch-step-date {
    font-size: 12px;
    color: #9aa3c7;
  }
  .ch-progress-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .ch-percent-text {
    font-weight: 700;
    color: #66dd95;
    font-size: 14px;
    min-width: 42px;
  }
  .ch-progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(120,130,200,0.15);
    border-radius: 4px;
    overflow: hidden;
  }
  .ch-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #5b6cff, #66dd95);
    border-radius: 4px;
  }
  .ch-progress-image {
    width: 100%;
    max-width: 240px;
    border-radius: 8px;
    margin-bottom: 8px;
    display: block;
  }
  .ch-progress-desc {
    font-size: 13px;
    color: #c9d0ff;
  }
  .ch-empty-progress {
    text-align: center;
    padding: 30px 10px;
    color: #9aa3c7;
  }
  .ch-empty-progress .empty-icon { font-size: 28px; margin-bottom: 8px; }
  .ch-empty-progress h4 { margin: 4px 0; color: #c9d0ff; }
  .ch-verifications {
    border-top: 1px solid rgba(120,130,200,0.1);
    padding-top: 8px;
  }
  .ch-verification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(120,130,200,0.08);
    font-size: 13px;
  }
  .ch-verification-item:last-child { border-bottom: none; }
  .muted { color: #9aa3c7; }
`;