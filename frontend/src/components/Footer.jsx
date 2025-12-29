import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Izquierda: Copyright */}
        <div className="text-sm text-center md:text-left">
          <span className="font-semibold text-space-orange">SPACE</span> &copy; {currentYear}.
          Todos os direitos reservados.
        </div>

        {/* Derecha: Hecho con amor */}
        <div className="flex items-center text-sm gap-1">
          <span>Feito com</span>
          <Heart className="h-4 w-4 text-red-500 fill-current" />
          <span>pela equipe de Tecnologia</span>
        </div>

      </div>
    </footer>
  );
}