import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-gray-300 px-4 py-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* About */}
        <div>
          <h4 className="text-white text-base font-semibold mb-3">About Us</h4>
          <p className="text-xs">
            We connect people with the best services and professionals. 
            Your satisfaction is our priority.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white text-base font-semibold mb-3">Contact</h4>
          <ul className="text-xs space-y-1.5">
            <li>Email: support@journata.com</li>
            <li>Phone: +216 00 000 000</li>
            <li>Address: Cité Mahrajen, Tataouine El Watan</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-white text-base font-semibold mb-3">Follow Us</h4>
          <div className="flex flex-col space-y-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-pink-500">
              <FaInstagram className="text-xl" />
              <span>Instagram</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-blue-500">
              <FaFacebook className="text-xl" />
              <span>Facebook</span>
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-green-400">
              <FaWhatsapp className="text-xl" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 mt-6 pt-3 text-center text-xs">
        &copy; 2025 Journata. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
