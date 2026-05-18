export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
      <h2 className="font-bold text-lg">{job.title}</h2>
      <p className="text-gray-500">{job.location}</p>

      <button className="mt-3 bg-orange-500 text-white px-4 py-1 rounded">
        Başvur
      </button>
    </div>
  )
}