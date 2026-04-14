// Renders the Dashboard page and coordinates its UI state.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Clock3, Rocket, CheckCircle2, ArrowUpRight, UserRound, BriefcaseBusiness, Files, Layers3 } from 'lucide-react'
import Card from '../components/Card'
import { authApi, getCurrentUserName, getCurrentUserRole, jobApi, profileApi } from '../services/api'

const container = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

const item = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

const emptyUserData = {
  profile: null,
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
  jobs: []
}

const emptyAdminData = {
  users: [],
  profiles: [],
  jobs: [],
  applications: []
}

const calculateProfileCompletion = (profile) => {
  if (!profile) return 0

  const fields = [
    profile.professional_title,
    profile.summary,
    profile.phone,
    profile.address,
    profile.linkedin_url,
    profile.github_url,
    profile.portfolio_url
  ]

  const completed = fields.filter((value) => typeof value === 'string' && value.trim()).length
  return Math.round((completed / fields.length) * 100)
}

export default function Dashboard() {
  const currentUserName = getCurrentUserName()
  const currentRole = getCurrentUserRole()
  const isAdmin = currentRole === 'admin'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState(emptyUserData)
  const [adminData, setAdminData] = useState(emptyAdminData)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError('')

        if (isAdmin) {
          const [usersResponse, profilesResponse, jobsResponse, applicationsResponse] =
            await Promise.all([
              authApi.get('/users'),
              profileApi.get('/profiles'),
              jobApi.get('/job-offers'),
              jobApi.get('/applications')
            ])

          setAdminData({
            users: usersResponse.data?.users || [],
            profiles: profilesResponse.data?.profiles || [],
            jobs: jobsResponse.data?.jobOffers || [],
            applications: applicationsResponse.data?.applications || []
          })
        } else {
          const requests = [
            profileApi.get('/profiles/me').catch(() => ({ data: { profile: null } })),
            profileApi.get('/experiences/me').catch(() => ({ data: { experiences: [] } })),
            profileApi.get('/educations/me').catch(() => ({ data: { educations: [] } })),
            profileApi.get('/skills/me').catch(() => ({ data: { skills: [] } })),
            profileApi.get('/languages/me').catch(() => ({ data: { languages: [] } })),
            jobApi.get('/job-offers').catch(() => ({ data: { jobOffers: [] } }))
          ]

          const [
            profileResponse,
            experiencesResponse,
            educationsResponse,
            skillsResponse,
            languagesResponse,
            jobsResponse
          ] = await Promise.all(requests)

          setUserData({
            profile: profileResponse.data?.profile || null,
            experiences: experiencesResponse.data?.experiences || [],
            educations: educationsResponse.data?.educations || [],
            skills: skillsResponse.data?.skills || [],
            languages: languagesResponse.data?.languages || [],
            jobs: jobsResponse.data?.jobOffers || []
          })
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [isAdmin])

  const userStats = useMemo(() => {
    const completion = calculateProfileCompletion(userData.profile)
    return [
      { title: 'Profile completion', value: `${completion}%`, sub: completion >= 70 ? 'Good progress' : 'Complete more fields', accent: 'Pr' },
      { title: 'Experiences', value: String(userData.experiences.length), sub: 'Saved in your profile', accent: 'Ex' },
      { title: 'Skills', value: String(userData.skills.length), sub: 'Ready for AI matching', accent: 'Sk' },
      { title: 'Available jobs', value: String(userData.jobs.length), sub: 'You can apply now', accent: 'Job' }
    ]
  }, [userData])

  const adminStats = useMemo(() => [
    { title: 'Users', value: String(adminData.users.length), sub: 'Registered accounts', accent: 'Us' },
    { title: 'Profiles', value: String(adminData.profiles.length), sub: 'Profiles created', accent: 'Pf' },
    { title: 'Jobs', value: String(adminData.jobs.length), sub: 'Offers in pipeline', accent: 'Job' },
    { title: 'Applications', value: String(adminData.applications.length), sub: 'Submitted so far', accent: 'App' }
  ], [adminData])

  const recentUserExperiences = userData.experiences.slice(0, 3)
  const recentJobs = userData.jobs.slice(0, 4)
  const recentUsers = adminData.users.slice(0, 4)
  const recentProfiles = adminData.profiles.slice(0, 4)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap" variants={item}>
        <div>
          <div className="pill">Dashboard</div>
          <h1 className="text-3xl font-semibold mt-2 text-slate-900">Welcome back, {currentUserName}</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin
              ? 'Monitor platform activity, manage profiles, and keep the pipeline clean.'
              : 'Track your profile progress, opportunities, and application readiness.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={isAdmin ? '/profile' : '/generate'}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-3 rounded-xl font-semibold shadow-soft"
          >
            <Sparkles size={18} />
            {isAdmin ? 'Manage profiles' : 'New AI draft'}
          </Link>
        </div>
      </div>

      {error && (
        <motion.div className="card mt-6 text-sm text-red-500" variants={item}>
          {error}
        </motion.div>
      )}

      {loading ? (
        <motion.div className="card mt-6 text-sm text-slate-500" variants={item}>
          Loading dashboard...
        </motion.div>
      ) : (
        <>
          <motion.div
            className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2 xl:grid-cols-4'} gap-4 mt-6`}
            variants={container}
          >
            {(isAdmin ? adminStats : userStats).map((stat) => (
              <motion.div key={stat.title} variants={item}>
                <Card {...stat} />
              </motion.div>
            ))}
          </motion.div>

          {!isAdmin && (
            <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6" variants={container}>
              <motion.div className="card lg:col-span-2" variants={item}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="pill mb-2">Recent experiences</p>
                    <h3 className="text-lg font-semibold text-slate-900">Your strongest stories</h3>
                    <p className="text-sm text-slate-500">These experiences will feed CV generation and job matching.</p>
                  </div>
                  <Link to="/experiences" className="text-xs text-primary font-semibold flex items-center gap-1">
                    Manage <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {recentUserExperiences.length === 0 && (
                    <div className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60 text-sm text-slate-500">
                      No experiences yet. Add one from the Experiences page.
                    </div>
                  )}
                  {recentUserExperiences.map((experience) => (
                    <motion.div
                      key={experience.id}
                      whileHover={{ scale: 1.005 }}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{experience.jobTitle}</p>
                        <p className="text-xs text-slate-500">{experience.company}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="pill">{experience.skills?.length || 0} skills</span>
                        <span className="text-sm text-primary font-semibold">{experience.startDate || 'Recent'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="space-y-4">
                <motion.div className="card" variants={item}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Profile readiness</p>
                      <p className="text-xl font-semibold text-slate-900">{calculateProfileCompletion(userData.profile)}%</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    {userData.profile
                      ? 'Keep filling your profile so generated documents stay accurate.'
                      : 'Create your profile to unlock applications and document generation.'}
                  </p>
                </motion.div>

                <motion.div className="card" variants={item}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Quick summary</p>
                      <p className="text-xl font-semibold text-slate-900">{userData.languages.length} languages</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>{userData.educations.length} formations saved</p>
                    <p>{userData.skills.length} skills available for matching</p>
                    <p>{userData.jobs.length} jobs currently visible</p>
                  </div>
                </motion.div>

                <motion.div className="card bg-gradient-to-br from-slate-900 to-dark text-white" variants={item}>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Rocket size={18} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-200">Next step</p>
                      <h4 className="text-xl font-semibold">Apply smarter with your latest profile</h4>
                      <ul className="space-y-2 text-sm text-slate-200">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={16} /> Complete your profile.
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={16} /> Add experiences and skills.
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={16} /> Pick a job and apply.
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {!isAdmin && (
            <motion.div className="card mt-6" variants={item}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="pill mb-2">Job opportunities</p>
                  <h3 className="text-lg font-semibold text-slate-900">Latest openings</h3>
                </div>
                <Link to="/jobs" className="text-xs text-primary font-semibold flex items-center gap-1">
                  Browse jobs <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentJobs.length === 0 && (
                  <div className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60 text-sm text-slate-500">
                    No jobs available yet.
                  </div>
                )}
                {recentJobs.map((job) => (
                  <div key={job.id} className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60">
                    <p className="text-sm font-semibold text-slate-800">{job.jobTitle}</p>
                    <p className="text-xs text-slate-500">{job.company}</p>
                    <p className="text-xs text-primary font-semibold mt-2">{job.location || 'Remote'}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {isAdmin && (
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6" variants={container}>
              <motion.div className="card" variants={item}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="pill mb-2">Users</p>
                    <h3 className="text-lg font-semibold text-slate-900">Latest accounts</h3>
                  </div>
                  <UserRound size={18} className="text-primary" />
                </div>
                <div className="mt-5 space-y-3">
                  {recentUsers.length === 0 && (
                    <div className="text-sm text-slate-500">No users yet.</div>
                  )}
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="pill">{user.role}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div className="card" variants={item}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="pill mb-2">Profiles</p>
                    <h3 className="text-lg font-semibold text-slate-900">Latest profiles</h3>
                  </div>
                  <Layers3 size={18} className="text-primary" />
                </div>
                <div className="mt-5 space-y-3">
                  {recentProfiles.length === 0 && (
                    <div className="text-sm text-slate-500">No profiles yet.</div>
                  )}
                  {recentProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {[profile.user?.first_name, profile.user?.last_name].filter(Boolean).join(' ') || profile.user?.email || 'Unknown user'}
                        </p>
                        <p className="text-xs text-slate-500">{profile.professional_title || 'No title'}</p>
                      </div>
                      <span className="pill">{profile.user?.role || 'user'}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div className="card" variants={item}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="pill mb-2">Jobs</p>
                    <h3 className="text-lg font-semibold text-slate-900">Pipeline overview</h3>
                  </div>
                  <BriefcaseBusiness size={18} className="text-primary" />
                </div>
                <div className="mt-5 space-y-3">
                  {adminData.jobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{job.jobTitle}</p>
                        <p className="text-xs text-slate-500">{job.company}</p>
                      </div>
                      <span className="text-xs text-primary font-semibold">{job.location || 'Remote'}</span>
                    </div>
                  ))}
                  {adminData.jobs.length === 0 && (
                    <div className="text-sm text-slate-500">No jobs yet.</div>
                  )}
                </div>
              </motion.div>

              <motion.div className="card bg-gradient-to-br from-slate-900 to-dark text-white" variants={item}>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Files size={18} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-200">Admin workflow</p>
                    <h4 className="text-xl font-semibold">Keep the platform active and organized</h4>
                    <ul className="space-y-2 text-sm text-slate-200">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} /> Review user profiles.
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} /> Add and manage job offers.
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} /> Monitor submitted applications.
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
