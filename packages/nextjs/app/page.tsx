"use client";

import { useCallback, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import {
  BackIcon,
  Composer,
  FollowButton,
  HomeIcon,
  IpfsText,
  Orb,
  PostRow,
  ProfileSetup,
  UserIcon,
  display,
  fName,
  sans,
  textMain,
  textDim,
  textMuted,
  accent,
  accentBg,
} from "~~/components/social/ui";
import { short, useSocial } from "~~/hooks/useSocial";

type View = { t: "home" } | { t: "profile"; a: string } | { t: "thread"; id: string };

export default function Home() {
  const S = useSocial();
  const { address } = useAccount();
  const myAddress = S.me;
  const scroller = useRef<HTMLDivElement>(null);
  const [stack, setStack] = useState<View[]>([{ t: "home" }]);
  const [tab, setTab] = useState<"all" | "following">("all");
  const view = stack[stack.length - 1];

  const go = useCallback(
    (v: View) => {
      setStack((s) => [...s, v]);
      scroller.current?.scrollTo({ top: 0 });
    },
    [setStack, scroller],
  );
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), [setStack]);
  const toProfile = useCallback((a: string) => go({ t: "profile", a }), [go]);
  const toThread = useCallback((id: string) => go({ t: "thread", id }), [go]);
  const myProfile = S.me ? S.profiles.get(S.me) : undefined;

  const goToProfile = useCallback(() => {
    if (myAddress) {
      setStack((s) => [...s, { t: "profile", a: myAddress }]);
      scroller.current?.scrollTo({ top: 0 });
    }
  }, [setStack, scroller, myAddress]);

  const row = (p: any, large = false) => (
    <PostRow key={p.id} post={p} S={S} onProfile={toProfile} onThread={toThread} large={large} />
  );

  const feed = (list: any[], empty: string) =>
    S.error && list.length === 0 ? (
      <p className="px-4 py-10 text-center text-[#71767b]">{S.error}</p>
    ) : S.loading ? (
      <p className="px-4 py-10 text-center text-[#71767b]">Loading posts…</p>
    ) : list.length === 0 ? (
      <p className="px-4 py-10 text-center text-[#71767b]">{empty}</p>
    ) : (
      list.map((p) => row(p))
    );

  const title =
    view.t === "home" ? "Home" : view.t === "profile" ? "Profile" : "Post";

  // ---------- Views ----------
  let content: JSX.Element | null = null;
  if (view.t === "home") {
    const list =
      tab === "all"
        ? S.topPosts
        : S.topPosts.filter((p) => p.author === S.me || S.following(p.author));
    content = (
      <>
        {!address ? (
          <p className="border-b border-[#202020]/40 px-4 py-6 text-[#71767b] text-sm">
            Everything here is public. Connect a wallet to post, like and follow.
          </p>
        ) : !myProfile ? (
          <ProfileSetup S={S} />
        ) : (
          <>
            <Composer
              S={S}
              placeholder="What is happening?"
              label="Post"
              onSubmit={(t) => S.publish(t)}
            />
            <div className="flex gap-6 border-b border-[#202020]/40 px-4 py-2">
              {(["all", "following"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`-mb-px border-b-2 py-2 text-sm font-bold transition-all ${
                    tab === t
                      ? `${accent} border-[#1d9bf0]`
                      : `${textDim} border-transparent hover:text-[#f7f9f9]`
                  }`}
                >
                  {t === "all" ? "For you" : "Following"}
                </button>
              ))}
            </div>
            {feed(
              list,
              tab === "all"
                ? "Nothing here yet. Publish the first post."
                : "Your Following feed is empty. Follow someone from For you to see their posts here.",
            )}
          </>
        )}
      </>
    );
  } else if (view.t === "profile") {
    const a = view.a;
    const prof = S.profiles.get(a);
    const posts = S.allPosts.filter((p) => p.author === a);
    content = (
      <>
        <div className="border-b border-[#202020]/40 px-4 py-4">
          <div className="flex items-start justify-between mb-3">
            <Orb address={a} size={72} />
            {S.me && S.me !== a && <FollowButton S={S} address={a} />}
          </div>
          <h2 className={`${fName} mt-2 text-2xl tracking-tight`}>
            {prof ? `@${prof.handle}` : short(a)}
          </h2>
          <p className={`${textDim} text-sm`}>{short(a)}</p>
          {prof?.cid && <IpfsText cid={prof.cid} className="mt-2" />}
          <dl className="mt-4 flex gap-6 text-sm">
            {[
              ["Posts", posts.length],
              ["Following", S.followingCount(a)],
              ["Followers", S.followerCount(a)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className={textDim}>{k}</dt>
                <dd className={`${fName} text-lg`}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {feed(posts, "No posts yet.")}
      </>
    );
  } else {
    const post = S.posts.get(view.id);
    const parent =
      post && post.replyTo !== "0" ? S.posts.get(post.replyTo) : undefined;
    const replies = (S.replies.get(view.id) ?? [])
      .map((id) => S.posts.get(id)!)
      .filter(Boolean);
    content = post ? (
      <>
        {parent && row(parent)}
        {row(post, true)}
        {myProfile ? (
          <Composer
            S={S}
            placeholder="Write a reply"
            label="Reply"
            onSubmit={(t) => S.publish(t, post.id)}
          />
        ) : (
          <p className="border-b border-[#202020]/40 px-4 py-4 text-[#71767b] text-sm">
            Connect a wallet and create a profile to reply.
          </p>
        )}
        {replies.length === 0 ? (
          <p className="px-4 py-8 text-center text-[#71767b] text-sm">
            No replies yet.
          </p>
        ) : (
          [...replies].reverse().map((p) => row(p))
        )}
      </>
    ) : (
      <p className="px-4 py-10 text-center text-[#71767b] text-sm">
        {S.loading ? "Loading…" : "This post doesn't exist."}
      </p>
    );
  }

  // ---------- Who to follow ----------
  const suggestions = [...S.profiles.keys()]
    .filter((a) => a !== S.me && !S.following(a))
    .sort((a, b) => S.followerCount(b) - S.followerCount(a))
    .slice(0, 4);

  // ---------- Nav item ----------
  const navItem = (
    icon: JSX.Element,
    label: string,
    active: boolean,
    onClick: () => void,
    disabled = false
  ) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? `bg-[#1d9bf0]/10 ${accent} text-[#1d9bf0]`
          : `${textDim} hover:bg-[#161616]/50 hover:text-[#f7f9f9]`
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div
      ref={scroller}
      className={`${sans.className} fixed inset-0 z-40 overflow-y-auto bg-[#000000] ${textMain} selection:bg-[#1d9bf0]`}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#202020]/40 bg-[#000000]/80 px-4 py-2 backdrop-blur-md">
        <button onClick={() => setStack([{ t: "home" }])} className="-ml-1 flex items-center gap-2">
          <span className={`${display.className} text-xl font-bold tracking-tight`}>OrbitX</span>
        </button>
        <div className="flex items-center gap-3">
          {S.me ? (
            <button onClick={() => S.me && go({ t: "profile", a: S.me })} className="p-2 rounded-full hover:bg-[#161616] transition-colors">
              <Orb address={S.me} size={28} />
            </button>
          ) : (
            <RainbowKitCustomConnectButton />
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px]">
        {/* Left rail */}
        <nav
          className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-64 shrink-0 flex-col px-3 py-4 md:flex"
        >
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setStack([{ t: "home" }])}
              className={`mb-4 flex flex-col items-center gap-1 text-[20px] font-bold tracking-tight`}
            >
              <HomeIcon size={22} className={textMuted} />
              <span>OrbitX</span>
              <span className="text-xs text-[#536471] font-normal tracking-wider uppercase">Connect Freely. Share Decentrally.</span>
            </button>
            {navItem(
              <HomeIcon size={20} />,
              "Home",
              view.t === "home" && stack.length === 1,
              () => setStack([{ t: "home" }])
            )}
            {navItem(
              <UserIcon size={20} />,
              "Profile",
              !!myAddress && view.t === "profile" && stack.length === 1 && myAddress,
              goToProfile,
              !myAddress
            )}
          </div>
          <div className="mt-auto pt-4 border-t border-[#202020]/40">
            <RainbowKitCustomConnectButton />
          </div>
        </nav>

        {/* Center column */}
        <main className="min-h-screen w-full max-w-[600px] border-x border-[#202020]/40 px-4 pb-24 md:px-0 md:border-x-0 md:pb-0">
          <div className="sticky top-[60px] z-10 flex items-center justify-between border-b border-[#202020]/40 bg-[#000000]/80 px-4 py-2 backdrop-blur-md">
            {stack.length > 1 && (
              <button onClick={back} aria-label="Go back" className="-ml-1 p-1.5 rounded-full hover:bg-[#161616] transition-colors">
                <BackIcon size={18} />
              </button>
            )}
            <h1 className={`${fName} text-lg`}>{title}</h1>
            <div className="w-6" />
          </div>
          <div className="pt-1">{content}</div>
        </main>

        {/* Right column */}
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-80 shrink-0 flex-col gap-6 px-6 py-4 lg:flex">
          <section>
            <h2 className={`${fName} mb-3 text-sm font-bold`}>Who to follow</h2>
            {suggestions.length === 0 ? (
              <p className={`${textDim} text-sm`}>
                Nobody else has joined yet. Invite a friend to make a profile.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {suggestions.map((a) => (
                  <li key={a} className="flex items-center gap-3">
                    <button
                      onClick={() => toProfile(a)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <Orb address={a} size={32} />
                      <span className={`${fName} truncate text-[14px]`}>
                        @{S.profiles.get(a)?.handle}
                      </span>
                    </button>
                    <FollowButton S={S} address={a} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className={`${textDim} text-xs leading-relaxed`}>
            OrbitX runs on Base Sepolia, a test network. Profiles, posts, likes
            and follows live on-chain.
            {S.contractAddress && (
              <>
                {" "}
                <a
                  className={`${accent} underline`}
                  target="_blank"
                  rel="noreferrer"
                  href={`https://sepolia.basescan.org/address/${S.contractAddress}`}
                >
                  View the contract
                </a>
              </>
            )}
          </p>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[#202020]/40 bg-[#000000]/90 px-4 py-2 backdrop-blur md:hidden">
        <button
          onClick={() => setStack([{ t: "home" }])}
          className={`p-2 rounded-full transition-colors ${
            view.t === "home" && stack.length === 1 ? accentBg : ""
          }`}
          aria-label="Home"
        >
          <HomeIcon size={22} color={view.t === "home" && stack.length === 1 ? "#0a0a0a" : "#71767b"} />
        </button>
        <button
          onClick={() => S.me && go({ t: "profile", a: S.me })}
          className="p-2 rounded-full transition-colors hover:bg-[#161616]"
          aria-label="Profile"
          disabled={!S.me}
        >
          <UserIcon size={22} />
        </button>
      </div>
    </div>
  );
}
