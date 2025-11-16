import {Link} from 'react-router-dom';
import Logo from '../components/logo';
function EntrepriseSidebar() {
    return (
        <div className="w-64 bg-blue-100 text-white h-screen px-6 justify-between flex flex-col items-start fixed left-0 top-0">
            <div>
                <div className='justify-start flex flex-col items-start'>
                    <Logo />
                    <h2 className="text-2xl font-semibold mt-8">Espace Entreprise</h2>
                </div>
                <nav className="flex flex-col space-y-5">
                    <Link to="/client/dashboard" className="hover:underline">Dashboard</Link>
                    <Link to="/client/tickets" className="hover:underline">Mes Tickets</Link>
                    <Link to="/client/nouveau-ticket" className="hover:underline">Nouveau Ticket</Link>
                    <Link to="/client/chatbot" className="hover:underline">Chatbot</Link>
                </nav>
            </div>
            <div>
                <Link to="/client/profil" className="hover:underline">Mon Profil</Link>
                <Link to="/deconnexion" className="hover:underline">Déconnexion</Link>
            </div>
        </div>
    );
}
export default EntrepriseSidebar;