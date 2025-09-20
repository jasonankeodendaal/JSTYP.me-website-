import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApps } from '../hooks/useApps';
import { useAppRequests } from '../hooks/useAppRequests';
import { useWebsiteDetails } from '../hooks/useWebsiteDetails';
import { usePinRecords } from '../hooks/usePinRecords';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useRedownloadRequests } from '../hooks/useRedownloadRequests'; // New hook
import { generateAboutPageContent, generateAppImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { ClockIcon, CheckCircleIcon, KeyIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, BanknotesIcon, LoginIcon, UsersIcon, PencilIcon, TrashIcon, SparklesIcon } from './IconComponents';
import type { AppShowcaseItem, TeamMember } from '../types';
import AppForm from './admin/AppForm';
import AppList from './admin/AppList';

type AdminTab = 'apps' | 'pins' | 'userRequests' | 'redownloadRequests' | 'settings' | 'team' | 'about';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { apps, addApp, deleteApp, updateApp, loading: appsLoading } = useApps();
  const { requests, updateRequestStatus, loading: requestsLoading } = useAppRequests();
  const { details: siteDetails, updateDetails: updateSiteDetails, loading: detailsLoading } = useWebsiteDetails();
  const { records: pinRecords, generatePin, loading: pinsLoading } = usePinRecords();
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, loading: teamLoading } = useTeamMembers();
  const { requests: redownloadRequests, updateRequest, loading: redownloadLoading } = useRedownloadRequests();
  
  const [authState, setAuthState] = useState<'pending' | 'unauthenticated' | 'authenticated'>('pending');
  const [userRole, setUserRole] = useState<'master' | 'team' | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('apps');
  
  const [editingApp, setEditingApp] = useState<AppShowcaseItem | null>(null);

  // Site Settings State
  const [currentSiteDetails, setCurrentSiteDetails] = useState(siteDetails);
  
  // PIN Generation State
  const [pinAppId, setPinAppId] = useState('');
  const [pinClientCompany, setPinClientCompany] = useState('');
  const [pinClientPerson, setPinClientPerson] = useState('');
  const [pinClientContact, setPinClientContact] = useState('');
  
  // Team Management State
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [memberPin, setMemberPin] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  
  // About Page State
  const [aboutRawText, setAboutRawText] = useState('');
  const [isGeneratingAbout, setIsGeneratingAbout] = useState(false);
  const [generatingImageState, setGeneratingImageState] = useState<{ [key: string]: boolean }>({});


  useEffect(() => {
    const role = sessionStorage.getItem('jstyp-admin-role') as 'master' | 'team' | null;
    if (role) {
      setAuthState('authenticated');
      setUserRole(role);
    } else {
      setAuthState('unauthenticated');
    }
  }, []);
  
  useEffect(() => {
    if (editingMember) {
        setFirstName(editingMember.firstName);
        setLastName(editingMember.lastName);
        setTel(editingMember.tel);
        setEmail(editingMember.email);
        setRole(editingMember.role);
        setMemberPin(editingMember.pin);
        setProfileImageUrl(editingMember.profileImageUrl);
    }
  }, [editingMember]);

  useEffect(() => {
    if(siteDetails) {
        setCurrentSiteDetails(siteDetails);
    }
  }, [siteDetails]);

  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, onImageLoad: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { onImageLoad(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSiteDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(currentSiteDetails) {
        await updateSiteDetails(currentSiteDetails);
        
        // Apply theme instantly
        const root = document.documentElement;
        root.style.setProperty('--glow-color', currentSiteDetails.themeColor);
        root.style.setProperty('--background-color', currentSiteDetails.backgroundColor);
        root.style.setProperty('--text-color', currentSiteDetails.textColor);
        root.style.setProperty('--card-color', currentSiteDetails.cardColor);
        root.style.setProperty('--border-color', currentSiteDetails.borderColor);
        root.style.setProperty('--font-family', currentSiteDetails.fontFamily);
        
        alert('Website details updated successfully!');
    }
  };
  
    const handleGenerateAboutContent = async () => {
        if (!aboutRawText.trim()) {
            alert('Please provide a description first.');
            return;
        }
        setIsGeneratingAbout(true);
        try {
            const content = await generateAboutPageContent(aboutRawText);
            setCurrentSiteDetails(prev => prev ? { ...prev, aboutPageContent: content } : null);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsGeneratingAbout(false);
        }
    };

    const handleGenerateAboutImage = async (key: string) => {
        if (!currentSiteDetails?.aboutPageContent) return;

        setGeneratingImageState(prev => ({ ...prev, [key]: true }));

        let prompt = '';
        if (key === 'intro') {
            prompt = currentSiteDetails.aboutPageContent.introduction.imagePrompt;
        } else {
            const index = parseInt(key.split('-')[1]);
            prompt = currentSiteDetails.aboutPageContent.sections[index].imagePrompt;
        }
        
        try {
            const imageUrl = await generateAppImage(prompt, '16:9');
            setCurrentSiteDetails(prev => {
                if (!prev || !prev.aboutPageContent) return prev;

                const newAboutContent = { ...prev.aboutPageContent };
                if (key === 'intro') {
                    newAboutContent.introduction = { ...newAboutContent.introduction, imageUrl };
                } else {
                    const index = parseInt(key.split('-')[1]);
                    const newSections = [...newAboutContent.sections];
                    newSections[index] = { ...newSections[index], imageUrl };
                    newAboutContent.sections = newSections;
                }

                return { ...prev, aboutPageContent: newAboutContent };
            });
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setGeneratingImageState(prev => ({ ...prev, [key]: false }));
        }
    };

  const handlePinGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinAppId || !pinClientCompany || !pinClientPerson || !pinClientContact) { alert('Please fill in all client details to generate a PIN.'); return; }
    if(!apps) return;
    const app = apps.find(a => a.id === pinAppId);
    if (!app) { alert('Selected app not found.'); return; }

    const newPin = await generatePin({
      appId: pinAppId, appName: app.name,
      clientDetails: { companyName: pinClientCompany, contactPerson: pinClientPerson, contactInfo: pinClientContact }
    });
    alert(`PIN Generated Successfully!\n\nPIN: ${newPin.pin}\nFor: ${app.name}\nClient: ${pinClientCompany}`);
    setPinAppId(''); setPinClientCompany(''); setPinClientPerson(''); setPinClientContact('');
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPin = pinInput.trim();
    
    // Master Admin/Owner Login
    if (usernameInput === 'JSTYP.me' && trimmedPin === '1723') {
        sessionStorage.setItem('jstyp-admin-role', 'master');
        setAuthState('authenticated');
        setUserRole('master');
        setLoginError('');
        return;
    }

    // Team Member Login
    const member = teamMembers?.find(m => m.pin === trimmedPin);
    if (member) {
        sessionStorage.setItem('jstyp-admin-role', 'team');
        setAuthState('authenticated');
        setUserRole('team');
        setLoginError('');
        return;
    }

    setLoginError('Incorrect Username or PIN.');
    setPinInput('');
  };
  
  const resetMemberForm = () => {
    setEditingMember(null); setFirstName(''); setLastName(''); setTel(''); setEmail('');
    setRole(''); setMemberPin(''); setProfileImageUrl('');
  };
  
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMemberPin = memberPin.trim();
    if (!firstName || !lastName || !trimmedMemberPin || !role) { alert('Please fill in all required member fields.'); return; }
    const memberData = { firstName, lastName, tel, email, pin: trimmedMemberPin, role, profileImageUrl };

    if (editingMember) {
        await updateTeamMember({ ...memberData, id: editingMember.id });
        alert('Team member updated!');
    } else {
        await addTeamMember(memberData);
        alert('Team member added!');
    }
    resetMemberForm();
  };
  
  const handleEditMember = (member: TeamMember) => { setEditingMember(member); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDeleteMember = (memberId: string) => { if(window.confirm('Delete this team member?')) { deleteTeamMember(memberId); } };

  const handleRedownloadApproval = async (reqId: string, clientName: string, clientId: string, appName: string, appId: string) => {
    const newPin = await generatePin({
      appId: appId,
      appName: appName,
      clientId: clientId,
      clientName: clientName,
      clientDetails: {
        companyName: `Re-download for ${clientName}`,
        contactPerson: clientName,
        contactInfo: 'N/A'
      }
    });
    const notes = `Approved. New PIN generated for client: ${newPin.pin}`;
    await updateRequest(reqId, 'approved', notes);
    alert(`Request approved. New PIN ${newPin.pin} generated for ${clientName}.`);
  };

  const handleRedownloadDenial = async (reqId: string) => {
    const reason = prompt("Please provide a reason for denial:");
    if(reason) {
      await updateRequest(reqId, 'denied', reason);
      alert('Request has been denied.');
    }
  };

  if (authState === 'pending' || detailsLoading || teamLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><LoadingSpinner size={12}/></div>;
  }
  
  if (authState === 'unauthenticated') {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <form onSubmit={handleLogin} className="bg-gray-800 shadow-md rounded-xl px-8 pt-6 pb-8 mb-4 border border-gray-700">
                    <div className="mb-4 text-center">
                        <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                        <p className="text-gray-400">Enter your credentials to continue.</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">Username</label>
                        <input className="bg-gray-700 border border-gray-600 rounded-lg w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500" id="username" type="text" placeholder="e.g., JSTYP.me" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />
                    </div>
                    <div className="mb-6">
                         <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="pin">PIN</label>
                        <input className="bg-gray-700 border border-gray-600 rounded-lg w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500" id="pin" type="password" placeholder="****" value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
                    </div>
                    {loginError && <p className="text-red-500 text-xs italic text-center mb-4">{loginError}</p>}
                    <div className="flex items-center justify-between">
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline flex items-center justify-center gap-2" type="submit">
                           <LoginIcon className="w-5 h-5"/> Sign In
                        </button>
                    </div>
                     <button type="button" onClick={() => navigate('/')} className="mt-4 w-full text-center text-gray-400 hover:text-white text-sm">Back to Site</button>
                </form>
            </div>
        </div>
    );
  }
  
  const TabButton: React.FC<{tab: AdminTab, label: string}> = ({ tab, label }) => ( <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeTab === tab ? 'bg-[var(--card-color)] text-orange-500' : 'bg-black/20 text-white hover:bg-[var(--card-color)]/80'}`}>{label}</button> );

  const handleEditApp = (app: AppShowcaseItem) => {
      setEditingApp(app);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
      setEditingApp(null);
  }


  return (
    <div className="min-h-screen bg-[var(--background-color)] p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-[var(--text-color)]">Admin <span className="text-orange-500 text-glow">Dashboard</span></h1>
            <button onClick={() => navigate('/')} className="bg-[var(--card-color)] text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors">Back to Site</button>
        </div>
        
        <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
            <TabButton tab="apps" label="App Management" />
            <TabButton tab="pins" label="PIN Management" />
            <TabButton tab="userRequests" label="User Ideas" />
            <TabButton tab="redownloadRequests" label="Client Requests" />
            {userRole === 'master' && <TabButton tab="settings" label="Website Settings" />}
            {userRole === 'master' && <TabButton tab="about" label="About Page" />}
            {userRole === 'master' && <TabButton tab="team" label="Team Management" />}
        </div>

        <div className="bg-[var(--card-color)] p-8 rounded-b-xl border-x border-b border-[var(--border-color)]">
            
            {activeTab === 'apps' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AppForm 
                        editingApp={editingApp}
                        onCancelEdit={handleCancelEdit}
                        addApp={addApp}
                        updateApp={updateApp}
                    />
                    <AppList 
                        apps={apps}
                        loading={appsLoading}
                        onEdit={handleEditApp}
                        onDelete={deleteApp}
                    />
                </div>
            )}
            
            {activeTab === 'pins' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2"><KeyIcon className="w-8 h-8 text-orange-500" />Generate New PIN</h2>
                        <form onSubmit={handlePinGenerate} className="space-y-4">
                            <select value={pinAppId} onChange={e => setPinAppId(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                <option value="">Select App...</option>
                                {apps?.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                            </select>
                            <input type="text" placeholder="Client Company Name" value={pinClientCompany} onChange={e => setPinClientCompany(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <input type="text" placeholder="Client Contact Person" value={pinClientPerson} onChange={e => setPinClientPerson(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <input type="text" placeholder="Client Email / Phone" value={pinClientContact} onChange={e => setPinClientContact(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">Generate PIN</button>
                        </form>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-white">PIN Redemption Log</h2>
                        {pinsLoading ? <LoadingSpinner /> : (
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 text-sm">
                                {pinRecords?.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()).map(rec => (
                                    <div key={rec.id} className={`p-3 rounded-lg ${rec.isRedeemed ? 'bg-green-900/50' : 'bg-gray-700'}`}>
                                        <div className="flex justify-between items-center font-mono">
                                            <span className="text-lg font-bold text-orange-400">{rec.pin}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${rec.isRedeemed ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>{rec.isRedeemed ? 'Redeemed' : 'Active'}</span>
                                        </div>
                                        <p className="text-white font-semibold">{rec.appName}</p>
                                        <p className="text-gray-300">{rec.clientDetails.companyName} ({rec.clientDetails.contactPerson})</p>
                                        {rec.clientName && <p className="text-cyan-300 text-xs">Redeemed by: {rec.clientName}</p>}
                                        <p className="text-gray-400 text-xs mt-1">Generated: {new Date(rec.generatedAt).toLocaleString()}</p>
                                        {rec.isRedeemed && <p className="text-red-300 text-xs">Redeemed: {new Date(rec.redeemedAt!).toLocaleString()}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'userRequests' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-white">User App Ideas</h2>
                  {requestsLoading ? <div className="flex justify-center"><LoadingSpinner /></div> : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {requests && requests.length > 0 ? (
                        requests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map(req => (
                            <div key={req.id} className="bg-gray-700 p-4 rounded-lg">
                              <p className="text-gray-300 whitespace-pre-wrap">{req.problemDescription}</p>
                              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-600">
                                <span className="text-xs text-gray-500">Submitted: {new Date(req.submittedAt).toLocaleString()}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold flex items-center gap-1 ${req.status === 'thinking' ? 'text-yellow-400' : 'text-green-400'}`}>{req.status === 'thinking' ? <ClockIcon className="w-4 h-4"/> : <CheckCircleIcon className="w-4 h-4"/>}{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                                  <button onClick={() => updateRequestStatus(req.id, req.status === 'thinking' ? 'done' : 'thinking')} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded" aria-label={`Mark as ${req.status === 'thinking' ? 'done' : 'thinking'}`}>Toggle Status</button>
                                </div>
                              </div>
                            </div>))
                      ) : ( <p className="text-gray-400">No app ideas submitted yet.</p> )}
                    </div>
                  )}
                </div>
            )}
             {activeTab === 'redownloadRequests' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-white">Client Re-download Requests</h2>
                  {redownloadLoading ? <div className="flex justify-center"><LoadingSpinner /></div> : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {redownloadRequests && redownloadRequests.length > 0 ? (
                        redownloadRequests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).map(req => (
                            <div key={req.id} className="bg-gray-700 p-4 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-white">{req.clientName} requests re-download for {req.appName}</p>
                                  <span className="text-xs text-gray-500">Requested: {new Date(req.requestedAt).toLocaleString()}</span>
                                </div>
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-yellow-500 text-black' : req.status === 'approved' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>{req.status}</span>
                              </div>
                              {req.resolutionNotes && <p className="text-sm mt-2 pt-2 border-t border-gray-600 text-gray-300">Notes: {req.resolutionNotes}</p>}
                              {req.status === 'pending' && (
                                <div className="flex items-center gap-4 mt-4">
                                  <button onClick={() => handleRedownloadApproval(req.id, req.clientName, req.clientId, req.appName, req.appId)} className="text-xs bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded">Approve</button>
                                  <button onClick={() => handleRedownloadDenial(req.id)} className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded">Deny</button>
                                </div>
                              )}
                            </div>))
                      ) : ( <p className="text-gray-400">No re-download requests yet.</p> )}
                    </div>
                  )}
                </div>
            )}
            
            {activeTab === 'settings' && userRole === 'master' && currentSiteDetails && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-white">Website Details & Theme</h2>
                    <form onSubmit={handleSiteDetailsSubmit} className="space-y-6 max-w-3xl mx-auto">
                        
                        <div className="p-4 border border-[var(--border-color)] rounded-lg">
                            <h3 className="text-xl font-bold mb-4 text-orange-400">Branding</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Company Name" value={currentSiteDetails.companyName} onChange={e => setCurrentSiteDetails({...currentSiteDetails, companyName: e.target.value})} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Logo (Header)</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, (url) => setCurrentSiteDetails(prev => ({...prev!, logoUrl: url})))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"/>
                                    {currentSiteDetails.logoUrl && <img src={currentSiteDetails.logoUrl} alt="logo preview" className="mt-4 rounded-lg w-24 h-24 object-cover bg-white p-1"/>}
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Intro Animation Logo</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, (url) => setCurrentSiteDetails(prev => ({...prev!, introLogoUrl: url})))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"/>
                                    {currentSiteDetails.introLogoUrl && <img src={currentSiteDetails.introLogoUrl} alt="intro logo preview" className="mt-4 rounded-lg max-w-[150px] max-h-24 object-cover bg-white p-1"/>}
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Intro Animation Background</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, (url) => setCurrentSiteDetails(prev => ({...prev!, introImageUrl: url})))} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"/>
                                    {currentSiteDetails.introImageUrl && <img src={currentSiteDetails.introImageUrl} alt="intro bg preview" className="mt-4 rounded-lg w-full h-24 object-cover"/>}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-[var(--border-color)] rounded-lg">
                            <h3 className="text-xl font-bold mb-4 text-orange-400">Theme & Appearance</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                 <div className="col-span-full">
                                   <label htmlFor="fontFamily" className="font-semibold block mb-2">Font Family</label>
                                   <select id="fontFamily" value={currentSiteDetails.fontFamily} onChange={e => setCurrentSiteDetails({...currentSiteDetails, fontFamily: e.target.value})} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                        <option value="'Inter', sans-serif">Inter (Modern Sans-Serif)</option>
                                        <option value="'Roboto Mono', monospace">Roboto Mono (Techy Monospace)</option>
                                        <option value="'Lora', serif">Lora (Elegant Serif)</option>
                                   </select>
                                </div>
                                <div className="flex items-center gap-2">
                                   <label htmlFor="themeColor" className="font-semibold">Accent/Glow:</label>
                                   <input type="color" id="themeColor" value={currentSiteDetails.themeColor} onChange={e => setCurrentSiteDetails({...currentSiteDetails, themeColor: e.target.value})} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-lg"/>
                                </div>
                                <div className="flex items-center gap-2">
                                   <label htmlFor="backgroundColor" className="font-semibold">Background:</label>
                                   <input type="color" id="backgroundColor" value={currentSiteDetails.backgroundColor} onChange={e => setCurrentSiteDetails({...currentSiteDetails, backgroundColor: e.target.value})} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-lg"/>
                                </div>
                                 <div className="flex items-center gap-2">
                                   <label htmlFor="textColor" className="font-semibold">Text:</label>
                                   <input type="color" id="textColor" value={currentSiteDetails.textColor} onChange={e => setCurrentSiteDetails({...currentSiteDetails, textColor: e.target.value})} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-lg"/>
                                </div>
                                <div className="flex items-center gap-2">
                                   <label htmlFor="cardColor" className="font-semibold">Cards:</label>
                                   <input type="color" id="cardColor" value={currentSiteDetails.cardColor} onChange={e => setCurrentSiteDetails({...currentSiteDetails, cardColor: e.target.value})} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-lg"/>
                                </div>
                                <div className="flex items-center gap-2">
                                   <label htmlFor="borderColor" className="font-semibold">Borders:</label>
                                   <input type="color" id="borderColor" value={currentSiteDetails.borderColor} onChange={e => setCurrentSiteDetails({...currentSiteDetails, borderColor: e.target.value})} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-lg"/>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-[var(--border-color)] rounded-lg space-y-4">
                            <h3 className="text-xl font-bold mb-4 text-orange-400">Contact & Bank Details</h3>
                            <div className="flex items-center gap-2"><PhoneIcon className="w-6 h-6 text-gray-400" /><input type="tel" placeholder="Telephone" value={currentSiteDetails.tel} onChange={e => setCurrentSiteDetails({...currentSiteDetails, tel: e.target.value})} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/></div>
                            <div className="flex items-center gap-2"><PhoneIcon className="w-6 h-6 text-gray-400" /><input type="text" placeholder="WhatsApp Link" value={currentSiteDetails.whatsapp} onChange={e => setCurrentSiteDetails({...currentSiteDetails, whatsapp: e.target.value})} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/></div>
                            <div className="flex items-center gap-2"><EnvelopeIcon className="w-6 h-6 text-gray-400" /><input type="email" placeholder="Email Address" value={currentSiteDetails.email} onChange={e => setCurrentSiteDetails({...currentSiteDetails, email: e.target.value})} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/></div>
                            <div className="flex items-center gap-2"><MapPinIcon className="w-6 h-6 text-gray-400" /><textarea placeholder="Physical Address" value={currentSiteDetails.address} onChange={e => setCurrentSiteDetails({...currentSiteDetails, address: e.target.value})} rows={2} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea></div>
                            <div className="flex items-center gap-2"><BanknotesIcon className="w-6 h-6 text-gray-400" /><textarea placeholder="Bank Details" value={currentSiteDetails.bankDetails} onChange={e => setCurrentSiteDetails({...currentSiteDetails, bankDetails: e.target.value})} rows={3} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea></div>
                        </div>
                        
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">Save Website Details</button>
                    </form>
                </div>
            )}
            
            {activeTab === 'about' && userRole === 'master' && currentSiteDetails && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-white">Manage 'About Us' Page</h2>
                    
                    <div className="space-y-4 mb-8 p-4 bg-gray-700/50 rounded-lg">
                        <label htmlFor="aboutRawText" className="font-bold text-lg text-orange-400">1. Provide a brief description of your business</label>
                        <textarea
                            id="aboutRawText"
                            placeholder="e.g., We are JSTYP.me, a company dedicated to building custom AI-powered applications that solve real-world problems for our clients..."
                            value={aboutRawText}
                            onChange={e => setAboutRawText(e.target.value)}
                            rows={4}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                        <button type="button" onClick={handleGenerateAboutContent} disabled={isGeneratingAbout} className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-500 flex justify-center items-center gap-2">
                            {isGeneratingAbout ? <LoadingSpinner size={6} /> : <><SparklesIcon className="w-5 h-5" /> 2. Generate Page Content with AI</>}
                        </button>
                    </div>

                    {currentSiteDetails.aboutPageContent && (
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-white">3. Review and Generate Illustrations</h3>
                            {/* Introduction Section */}
                            <div className="p-4 border border-gray-700 rounded-lg">
                                <h4 className="font-bold text-lg text-orange-400">{currentSiteDetails.aboutPageContent.introduction.heading}</h4>
                                <p className="text-gray-300 mt-2 whitespace-pre-wrap">{currentSiteDetails.aboutPageContent.introduction.content}</p>
                                <div className="mt-4 p-2 bg-gray-900/50 rounded">
                                    <p className="text-xs text-gray-500">IMAGE PROMPT:</p>
                                    <p className="text-sm font-mono text-cyan-300">{currentSiteDetails.aboutPageContent.introduction.imagePrompt}</p>
                                </div>
                                {currentSiteDetails.aboutPageContent.introduction.imageUrl ? (
                                    <img src={currentSiteDetails.aboutPageContent.introduction.imageUrl} alt="Generated intro" className="mt-4 rounded-lg max-w-sm"/>
                                ) : (
                                    <button onClick={() => handleGenerateAboutImage('intro')} disabled={generatingImageState['intro']} className="mt-2 bg-indigo-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 flex items-center gap-2">
                                        {generatingImageState['intro'] ? <LoadingSpinner size={4} /> : 'Generate Illustration'}
                                    </button>
                                )}
                            </div>
                            {/* Other Sections */}
                            {currentSiteDetails.aboutPageContent.sections.map((section, index) => (
                                <div key={index} className="p-4 border border-gray-700 rounded-lg">
                                    <h4 className="font-bold text-lg text-orange-400">{section.heading}</h4>
                                    <p className="text-gray-300 mt-2 whitespace-pre-wrap">{section.content}</p>
                                    <div className="mt-4 p-2 bg-gray-900/50 rounded">
                                        <p className="text-xs text-gray-500">IMAGE PROMPT:</p>
                                        <p className="text-sm font-mono text-cyan-300">{section.imagePrompt}</p>
                                    </div>
                                    {section.imageUrl ? (
                                        <img src={section.imageUrl} alt={`Generated section ${index}`} className="mt-4 rounded-lg max-w-sm"/>
                                    ) : (
                                        <button onClick={() => handleGenerateAboutImage(`section-${index}`)} disabled={generatingImageState[`section-${index}`]} className="mt-2 bg-indigo-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 flex items-center gap-2">
                                            {generatingImageState[`section-${index}`] ? <LoadingSpinner size={4} /> : 'Generate Illustration'}
                                        </button>
                                    )}
                                </div>
                            ))}
                             <button type="button" onClick={handleSiteDetailsSubmit} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">4. Save 'About Us' Page</button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'team' && userRole === 'master' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2"><UsersIcon className="w-8 h-8 text-orange-500" />{editingMember ? 'Edit Team Member' : 'Add New Member'}</h2>
                        <form onSubmit={handleMemberSubmit} className="space-y-4">
                            <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <input type="tel" placeholder="Telephone" value={tel} onChange={e => setTel(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <input type="text" placeholder="Role (e.g., Developer)" value={role} onChange={e => setRole(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <input type="text" placeholder="Login PIN" value={memberPin} onChange={e => setMemberPin(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image</label>
                                <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, setProfileImageUrl)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"/>
                                {profileImageUrl && <img src={profileImageUrl} alt="preview" className="mt-4 rounded-full w-24 h-24 object-cover"/>}
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-gray-700">
                                {editingMember && (<button type="button" onClick={resetMemberForm} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel Edit</button>)}
                                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">{editingMember ? 'Update Member' : 'Add Member'}</button>
                            </div>
                        </form>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-white">Manage Team</h2>
                        <div className="space-y-4 max-h-[1200px] overflow-y-auto pr-2">
                        {teamMembers?.map(member => (
                            <div key={member.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <img src={member.profileImageUrl} alt={`${member.firstName} ${member.lastName}`} className="w-12 h-12 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-bold text-white">{`${member.firstName} ${member.lastName}`}</p>
                                        <p className="text-sm text-gray-400">{member.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditMember(member)} className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-gray-600 transition-colors" aria-label="Edit"><PencilIcon className="w-6 h-6" /></button>
                                    <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-gray-600 transition-colors" aria-label="Delete"><TrashIcon className="w-6 h-6" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default AdminPage;