export default function JobCard({job}) {
return (
<div className="bg-white p-4 rounded-xl shadow hover:scale-[1.02] transition">
<h2 className="font-bold">{job.title}</h2>
<p>{job.location}</p>
<button className="bg-orange-500 text-white px-3 py-1 rounded mt-2">
Başvur
</button>
</div>
);
}