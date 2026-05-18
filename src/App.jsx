import Navbar from "./components/Navbar"
import JobCard from "./components/JobCard"

const jobs = [
  { id: 1, title: "Elektrik Ustası", location: "Samsun" },
  { id: 2, title: "Kaynakçı", location: "İstanbul" },
  { id: 3, title: "İnşaat Ustası", location: "Ankara" }
]

export default function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-6 grid gap-4 md:grid-cols-3">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}