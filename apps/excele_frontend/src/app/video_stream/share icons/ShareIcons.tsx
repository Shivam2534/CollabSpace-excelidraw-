import {
  WhatsappShareButton,
  WhatsappIcon,
  TwitterShareButton,
  XIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share";

function ShareIcons() {
  return (
    <div className="flex gap-3">
      <div>
        <WhatsappShareButton
          url="https://zoom-meeting-app-amz4.vercel.app/receiver"
          title="join this link to meet me!!!"
          separator=":: "
          className="Demo__some-network__share-button"
        >
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>

      <div>
        <TwitterShareButton
          url="https://zoom-meeting-app-amz4.vercel.app/receiver"
          title="join this link to meet me!!!"
          className="Demo__some-network__share-button"
        >
          <XIcon size={32} round />
        </TwitterShareButton>
      </div>

      <div className="Demo__some-network">
        <LinkedinShareButton
          url="https://zoom-meeting-app-amz4.vercel.app/receiver"
          title="join this link to meet me!!!"
          className="Demo__some-network__share-button"
        >
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
      </div>
    </div>
  );
}

export { ShareIcons };
