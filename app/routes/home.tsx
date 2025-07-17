import React, { useState, useEffect } from "react";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ChartBarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";
import {useSdk} from "~/hooks/useSdk";
import {ConnectWallet} from "~/components/ConnectWallet";
import {formatAddress} from "~/utils";
import {DocumentWASM} from "pshenmic-dpp";

export function meta() {
  return [
    { title: "Dash Evolution Feed" },
    { name: "description", content: "Connect and share on the Dash Evolution network" },
  ];
}

const dataContractId = 'DguLeagz1hgqMVCiYq9Gd2f288NpJHWxFK1VPYFAxRAL'

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentIdentity, setCurrentIdentity] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const sdk = useSdk()

  const categories = [
    { id: "all", name: "All Posts", icon: SparklesIcon },
  ];

  // Load posts from localStorage on mount
  useEffect(() => {

    const loadPosts = async () => {
      const documents = await sdk.documents.query(dataContractId, 'posts', undefined, undefined, undefined, undefined, undefined, {contractKnownKeepHistory: true})
      setPosts(documents)
    }

    loadPosts()
        .catch((error) => {
          debugger

          console.error(error);
        })
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement> ) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const publishMessage = async () => {
      const data = {
        message: newPost
      }

      if (!currentIdentity) {
        throw new Error('Current Identity not set')
      }

      const document = await sdk.documents.create(dataContractId, 'posts', data, currentIdentity)

      let identityContractNonce

      try {
        identityContractNonce = await sdk.identities.getIdentityContractNonce(currentIdentity, dataContractId)
      } catch (e: any) {
        if (e.toString().startsWith('Error: Could not get identityContractNonce')) {
          identityContractNonce = 0n
        } else {
          throw e
        }
      }

      const stateTransition = sdk.documents.createStateTransition(document, 0, identityContractNonce + 1n)

      await window.dashPlatformExtension.signer.signAndBroadcast(stateTransition)
    }

    setLoading(true);

    publishMessage().then(() => {
      setNewPost("");
      window.location.reload()
    })
        .catch(error => console.error(error))
        .finally(()=> setLoading(false));
  };

  const extractHashtags = (text:string) => {
    const matches = text.match(/#\w+/g);
    return matches ? matches.slice(0, 3) : [];
  };

  const handleStar = () => {
    console.log('Handle start is not implemented')
  };

  const formatTimestamp = (timestamp: bigint) => {
    try {
      return formatDistanceToNow(new Date(parseInt(timestamp.toString())), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  // const filteredPosts = selectedCategory === "all"
  //     ? posts
  //     : posts.filter(post => post.category === selectedCategory);

  return (
      <div className="min-h-screen bg-gray-950">
        {/* Gradient background effect */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-gray-950 to-purple-950/20 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4">
          {/* Header */}
          <header className="sticky top-0 z-20 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                      src="/dash-icon.svg"
                      alt="Dash Evolution"
                      className="w-10 h-10 drop-shadow-lg"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-white">Dash Evolution Feed</h1>
                    <p className="text-sm text-gray-400">Connect with the community</p>
                  </div>
                </div>
                <ConnectWallet setCurrentIdentity={setCurrentIdentity}/>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mb-[1px]">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                      <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all whitespace-nowrap ${
                              selectedCategory === category.id
                                  ? "bg-gray-800/50 text-white border-b-2 border-blue-500"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </button>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Compose Box */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-5">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">Y</span>
                      </div>
                      <div className="flex-1">
                      <textarea
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          placeholder="Share your thoughts with the Dash community..."
                          className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                          rows={3}
                          disabled={loading}
                      />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pl-13">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Add hashtags to categorize your post</span>
                      </div>
                      <button
                          type="submit"
                          disabled={!newPost.trim() || loading || !currentIdentity}
                          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        {loading ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
                      <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No posts in this category yet. Be the first to share!</p>
                    </div>
                ) : (
                    posts.map((document: DocumentWASM) => (
                        <article
                            key={document.id.base58()}
                            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 hover:bg-gray-900/70 transition-all duration-200"
                        >
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-white">{formatAddress(document.ownerId.base58())}</h3>

                                  { document.ownerId.base58() === currentIdentity}
                                  <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                              Owner
                            </span>
                                </div>
                                <time className="text-sm text-gray-500">
                                  {formatTimestamp(document.createdAt ?? 0n)}
                                </time>
                              </div>

                              <p className="text-gray-200 mb-3 whitespace-pre-wrap">{document.properties.message}</p>

                              {/* Tags */}
                              {/*{post.tags && post.tags.length > 0 && (*/}
                              {/*  <div className="flex flex-wrap gap-2 mb-3">*/}
                              {/*    {post.tags.map((tag, index) => (*/}
                              {/*      <span*/}
                              {/*        key={index}*/}
                              {/*        className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg"*/}
                              {/*      >*/}
                              {/*        {tag}*/}
                              {/*      </span>*/}
                              {/*    ))}*/}
                              {/*  </div>*/}
                              {/*)}*/}

                              {/* Action buttons */}
                              <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleStar()}
                                    className={`flex items-center gap-2 text-sm transition-colors ${
                                        document.properties.starred
                                            ? "text-yellow-500"
                                            : "text-gray-400 hover:text-yellow-500"
                                    }`}
                                >
                                  {document.properties.starred ? (
                                      <StarIconSolid className="w-5 h-5" />
                                  ) : (
                                      <StarIcon className="w-5 h-5" />
                                  )}
                                  <span>0</span>
                                </button>

                                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                  <span>0</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                    ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-blue-500" />
                  Platform Stats
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Active Users</span>
                    <span className="text-white font-medium">12,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Posts</span>
                    <span className="text-white font-medium">45.2K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Network Growth</span>
                    <span className="text-green-400 font-medium">+23%</span>
                  </div>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />
                  Trending Topics
                </h2>
                <div className="space-y-2">
                  {["#DashEvolution", "#Platform", "#Development", "#DeFi", "#Identity"].map((topic, index) => (
                      <button
                          key={index}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                      >
                        {topic}
                      </button>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-blue-800/50 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-2">New to Dash Evolution?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Learn about decentralized identities and platform features.
                </p>
                <button className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
