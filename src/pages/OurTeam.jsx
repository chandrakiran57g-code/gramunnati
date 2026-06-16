import { motion } from 'framer-motion';
import { Linkedin, Mail, Users } from 'lucide-react';

const team = [
  { name: 'Dr. Ravi Kumar', role: 'Founder & Director', bio: 'A visionary leader with 20+ years in rural development and community empowerment across Andhra Pradesh and Telangana.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', dept: 'Leadership' },
  { name: 'Sunita Reddy', role: 'Program Director', bio: 'Expert in village development programs, tribal welfare, and women empowerment initiatives across South India.', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80', dept: 'Programs' },
  { name: 'Anil Sharma', role: 'Technology Lead', bio: 'Full-stack developer passionate about building digital tools for social impact and rural digitization.', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80', dept: 'Technology' },
  { name: 'Priya Venkat', role: 'School Empowerment Head', bio: 'Former principal turned education activist, driving school infrastructure and teacher training programs.', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80', dept: 'Education' },
  { name: 'Mohan Das', role: 'Field Coordinator', bio: 'On-ground coordinator for village surveys, project implementation, and community liaison work.', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', dept: 'Field' },
  { name: 'Lakshmi Naidu', role: 'Volunteer Coordinator', bio: 'Manages thousands of volunteers across states, matching skills with community needs for maximum impact.', photo: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=200&q=80', dept: 'Volunteers' },
  { name: 'Rajesh Chandra', role: 'Finance & Compliance', bio: 'Chartered accountant ensuring full transparency, compliance, and responsible utilization of all funds.', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80', dept: 'Finance' },
  { name: 'Deepa Krishnan', role: 'Communications Manager', bio: 'Storyteller who brings GramUnnati\'s impact to life through compelling narratives, social media, and outreach.', photo: 'https://images.unsplash.com/photo-1546961342-ea5f62d04cf8?w=200&q=80', dept: 'Communications' },
];

const deptColors = {
  Leadership: 'bg-village/10 text-village',
  Programs: 'bg-school/10 text-school',
  Technology: 'bg-projects/10 text-projects',
  Education: 'bg-donation/10 text-donation',
  Field: 'bg-green-100 text-green-700',
  Volunteers: 'bg-volunteer/10 text-volunteer',
  Finance: 'bg-cyan-100 text-cyan-700',
  Communications: 'bg-pink-100 text-pink-700',
};

export default function OurTeam() {
  return (
    <div className="min-h-screen bg-background">
      <div className="village-gradient py-16 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Users className="w-12 h-12 mx-auto mb-4 opacity-70" />
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Our Team</h1>
            <p className="text-white/80 max-w-2xl mx-auto">Passionate individuals dedicated to transforming rural India through technology, compassion, and community action</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="relative h-48 overflow-hidden">
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${deptColors[member.dept] || 'bg-muted text-muted-foreground'}`}>{member.dept}</span>
                <h3 className="font-heading font-bold text-base mt-3 mb-1">{member.name}</h3>
                <div className="text-xs text-school font-medium mb-3">{member.role}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                <div className="flex justify-center gap-3 mt-4">
                  <button className="p-1.5 rounded-lg hover:bg-school/10 text-muted-foreground hover:text-school transition-colors"><Linkedin className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-village/10 text-muted-foreground hover:text-village transition-colors"><Mail className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Advisory Board */}
        <div className="mt-20 text-center">
          <h2 className="font-heading text-3xl font-bold mb-3">Advisory Board</h2>
          <p className="text-muted-foreground mb-10">Distinguished experts guiding GramUnnati's strategy and governance</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Prof. S. Krishnamurthy', role: 'Former IAS, Rural Development Expert', org: 'Ministry of Panchayati Raj' },
              { name: 'Dr. Meera Rao', role: 'Education Policy Specialist', org: 'UNICEF India' },
              { name: 'Shri Ramaiah Goud', role: 'Agriculture & Cooperative Expert', org: 'NABARD' },
            ].map(adv => (
              <div key={adv.name} className="bg-village/5 rounded-2xl border border-village/10 p-6 text-center">
                <div className="w-16 h-16 bg-village/10 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">👤</div>
                <h4 className="font-heading font-bold text-base">{adv.name}</h4>
                <div className="text-xs text-village font-medium mt-1">{adv.role}</div>
                <div className="text-xs text-muted-foreground mt-1">{adv.org}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}