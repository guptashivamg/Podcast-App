import { User, Calendar, Globe, Link, Twitter, Instagram, Youtube, Facebook, Linkedin, Github, Pen } from "lucide-react";

interface ProfileAboutProps {
    user: {
        name?: string;
        bio?: string;
        website?: string;
        _creationTime?: number;
        socialLinks?: Array<{
            platform: string;
            url: string;
        }>;
    };
    isOwnProfile: boolean;
}

const ProfileAbout = ({ user, isOwnProfile }: ProfileAboutProps) => {
    // Get appropriate icon based on platform
    const getSocialIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'twitter': return <Twitter size={18} className="text-orange-1" />;
            case 'instagram': return <Instagram size={18} className="text-orange-1" />;
            case 'youtube': return <Youtube size={18} className="text-orange-1" />;
            case 'facebook': return <Facebook size={18} className="text-orange-1" />;
            case 'linkedin': return <Linkedin size={18} className="text-orange-1" />;
            case 'github': return <Github size={18} className="text-orange-1" />;
            default: return <Link size={18} className="text-orange-1" />;
        }
    };

    return (
        <section className="mb-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-orange-1/10 p-3 rounded-xl">
                    <User size={28} className="text-orange-1" />
                </div>
                <h1 className="text-2xl font-bold text-white-1">About {user?.name}</h1>
            </div>

            <div className="bg-white-1/5 rounded-xl p-6 border border-white-1/10">
                {/* Bio */}
                <div className={`flex flex-wrap gap-4 ${(user?.bio || isOwnProfile) ? "mb-6" : ""} `}>
                    {user?.bio ? (
                        <p className="text-white-2">{user.bio}</p>
                    ) : (
                        isOwnProfile && (
                            <p
                                className="text-white-3 italic flex items-center gap-2 cursor-pointer hover:text-white-2 transition-colors"
                                onClick={() => {
                                    const editButton = document.getElementById('profile-edit-button');
                                    if (editButton) editButton.click();
                                }}
                            >
                                Add a bio to tell others about yourself
                                <span className="bg-white-1/10 p-1 rounded-full">
                                    <Pen size={14} className="text-orange-1" />
                                </span>
                            </p>
                        )
                    )}
                </div>

                {/* Joining Date */}
                {/* <div className={`flex items-center gap-2 ${(user?.website || (user?.socialLinks && user?.socialLinks.length > 0) || isOwnProfile) ? "mb-6" : ""} text-white-2`}>
                    <Calendar size={18} className="text-orange-1" />
                    <span>Joined {user?._creationTime ? new Date(user._creationTime).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                        day: 'numeric'
                    }) : 'recently'}</span>
                </div> */}

                {/* Website and Social Links */}
                <div className="flex flex-wrap gap-2">
                    {user?.website && (
                        <a
                            href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-black-1/50 px-4 py-2 rounded-full hover:bg-white-1/10 transition-colors"
                        >
                            <Globe size={18} className="text-orange-1" />
                            <span className="text-white-2">Website</span>
                        </a>
                    )}

                    {user?.socialLinks && user.socialLinks.length > 0 && user.socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-black-1/50 px-4 py-2 rounded-full hover:bg-white-1/10 transition-colors"
                        >
                            {getSocialIcon(link.platform)}
                            <span className="text-white-2">{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</span>
                        </a>
                    ))}

                    {(!user?.website && (!user?.socialLinks || user.socialLinks.length === 0)) && isOwnProfile && (
                        <p
                            className="text-white-3 italic flex items-center gap-2 cursor-pointer hover:text-white-2 transition-colors"
                            onClick={() => {
                                const editButton = document.getElementById('profile-edit-button');
                                if (editButton) editButton.click();
                            }}
                        >
                            Add your website and social links to help others connect with you
                            <span className="bg-white-1/10 p-1 rounded-full">
                                <Pen size={14} className="text-orange-1" />
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProfileAbout;