import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-secondary-500">فاشون ستاي</h3>
            <p className="text-gray-400 leading-relaxed">
              متجر إلكتروني متخصص في الملابس النسائية العصرية. نقدم تشكيلة مميزة من الفساتين والعبايات والإكسسوارات بأعلى جودة.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-secondary-500">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors">
                  سلة التسوق
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-secondary-500">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={18} />
                <span>+249 99 583 1217</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin size={18} />
                <span>الخرطوم - السودان</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Clock size={18} />
                <span>السبت - الخميس: 9 ص - 9 م</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>جميع الحقوق محفوظة © 2024 فاشون ستاي</p>
        </div>
      </div>
    </footer>
  );
}
