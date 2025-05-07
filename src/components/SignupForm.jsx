import { useState } from "react";
import supabase from "../supabaseClient";
import {User,Mail,Lock,Phone,Briefcase,MapPin,Info,UserCog,Users,} from "lucide-react";

function SignupForm({ closeModal }) {
  const [formData, setFormData] = useState({
    name: "",
    job: "",
    address: "",
    email: "",
    password: "",
    role: "worker",
    phone: "",
    description: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const jobs = [
    "Technicien HVAC", "Électricien Bâtiment", "Plombier Sanitaire", "Charpentier Bois",
    "Soudeur TIG/MIG", "Mécanicien Auto", "Ouvrier BTP", "Peintre Bâtiment", "Maçon VRD",
    "Conducteur Engins TP", "Couvreur Zingueur", "Vitrier Poseur", "Plaquiste",
    "Carreleur Mosaïste", "Poseur Sols", "Tôlier Carrossier", "Chaudronnier Industriel",
    "Serrurier Métallier", "Installateur PV", "Réparateur Électroménager", "Technicien Éolien",
    "Frigoriste", "Ascensoriste", "Opérateur CNC", "Installateur Fibre", "Agent Maintenance Multi",
    "Conducteur SPL", "Grutier Mobile", "Monteur Échafaudage", "Électromécanicien"
  ];

  const locations = ["Ariana","Béja","Ben Arous","Bizerte","Gabès","Gafsa","Jendouba","Kairouan","Kasserine","Kebili","Le Kef","Mahdia","Manouba","Médenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana","Sousse","Tataouine","Tozeur","Tunis","Zaghouan"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData((prev) => ({
      ...prev,
      role,
      job: role === "worker" ? prev.job : "",
      phone: role === "worker" ? prev.phone : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { name, job, address, email, password, role, phone, description } = formData;

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const profileData = {
        user_id: data.user.id,
        name,
        address,
        role,
        description,
        ...(role === "worker" && { job, phone }),
      };

      const { error: dbError } = await supabase.from("profiles").insert([profileData]);
      if (dbError) throw dbError;

      alert("Sign-up successful! Check your email to verify.");
      closeModal();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        ✕
      </button>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-white/40 blur-xl rounded-full scale-110"></div>
          <img src="/images/logo.png" alt="Journata Logo" className="h-12 w-auto relative z-10 hover:scale-105 transition-transform duration-300" />
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="flex gap-4">
          <label className="flex items-center">
            <UserCog size={20} className="text-blue-600 mr-1" />
            <input type="radio" name="role" value="worker" checked={formData.role === "worker"} onChange={handleRoleChange} className="mr-1" />
            <span>Worker</span>
          </label>
          <label className="flex items-center">
            <Users size={20} className="text-green-600 mr-1" />
            <input type="radio" name="role" value="client" checked={formData.role === "client"} onChange={handleRoleChange} className="mr-1" />
            <span>Client</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center border p-2 rounded w-full gap-2">
          <User size={18} className="text-gray-600" />
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="w-full bg-transparent focus:outline-none" />
        </div>

        <div className="flex items-center border p-2 rounded w-full gap-2">
          <MapPin size={18} className="text-gray-600" />
          <select name="address" value={formData.address} onChange={handleChange} required className="w-full bg-transparent focus:outline-none">
            <option value="">Select a location</option>
            {locations.map((loc, i) => (
              <option key={i} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {formData.role === "worker" && (
          <>
            <div className="flex items-center border p-2 rounded w-full gap-2">
              <Briefcase size={18} className="text-gray-600" />
              <select name="job" value={formData.job} onChange={handleChange} required className="w-full bg-transparent focus:outline-none">
                <option value="">Select a job</option>
                {jobs.map((j, i) => (
                  <option key={i} value={j}>{j}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center border p-2 rounded w-full gap-2">
              <Phone size={18} className="text-gray-600" />
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="w-full bg-transparent focus:outline-none" />
            </div>
          </>
        )}

        <div className="flex items-start border p-2 rounded w-full gap-2">
          <Info size={18} className="text-gray-600 mt-1" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full bg-transparent focus:outline-none"></textarea>
        </div>

        <div className="flex items-center border p-2 rounded w-full gap-2">
          <Mail size={18} className="text-gray-600" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full bg-transparent focus:outline-none" />
        </div>

        <div className="flex items-center border p-2 rounded w-full gap-2">
          <Lock size={18} className="text-gray-600" />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="w-full bg-transparent focus:outline-none" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition">
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignupForm;
