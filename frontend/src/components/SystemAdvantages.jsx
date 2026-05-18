import { CheckCircle2, TrendingUp, Users, ShieldCheck } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';

export default function SystemAdvantages() {
  const advantages = [
    {
      icon: <Users className="h-6 w-6 text-white" />,
      title: "Gestão Centralizada",
      description: "Controle funcionários, empresas e solicitações em uma única plataforma intuitiva."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      title: "Relatórios Detalhados",
      description: "Acompanhe pagamentos e presença com relatórios precisos e exportáveis."
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-white" />,
      title: "Aprovações Ágeis",
      description: "Fluxo de aprovação de solicitações otimizado para não atrasar a operação."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-white" />,
      title: "Segurança Total",
      description: "Seus dados corporativos protegidos com os mais altos padrões de segurança."
    }
  ];

  return (
    <div className="hidden lg:flex lg:flex-col justify-center bg-gradient-to-br from-space-orange to-orange-800 p-12 text-white relative overflow-hidden h-full">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-black opacity-10 mix-blend-overlay"></div>
      
      <div className="relative z-10 max-w-lg mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          Transforme a gestão da sua equipe
        </h1>
        <p className="text-lg text-orange-100 mb-12">
          O EquipeFlex simplifica a administração de pessoal, automatiza processos e traz clareza para suas decisões diárias.
        </p>

        <div className="space-y-8">
          {advantages.map((adv, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10 shadow-sm">
                  {adv.icon}
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-xl font-semibold">{adv.title}</h3>
                <p className="mt-1 text-orange-100">{adv.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <WhatsAppButton />
        
        {/* Testimonial or trust badge could go here */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-orange-800" src="https://ui-avatars.com/api/?name=User+1&background=random" alt="" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-orange-800" src="https://ui-avatars.com/api/?name=User+2&background=random" alt="" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-orange-800" src="https://ui-avatars.com/api/?name=User+3&background=random" alt="" />
            </div>
            <p className="ml-4 text-sm font-medium text-orange-100">
              Junte-se a dezenas de empresas inovadoras
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
