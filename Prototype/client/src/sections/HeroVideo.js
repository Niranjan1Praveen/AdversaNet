import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
function HeroVideo(props) {
  return (
    <div className="relative max-w-6xl mx-auto px-4 py-10">
      <HeroVideoDialog
        className="block dark:hidden"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
        thumbnailSrc="/heroVideoThumbnail.png"
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
        thumbnailSrc="/heroVideoThumbnail.png"
        thumbnailAlt="Hero Video"
      />
    </div>
  );
}

export default HeroVideo;
