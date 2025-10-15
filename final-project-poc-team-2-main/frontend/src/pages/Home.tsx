

const images = [
  {
    src: "image1.webp",
    alt: "Image 1",
  },
  {
    src: "image2.webp",
    alt: "Image 2",
  },
  {
    src: "image3.webp",
    alt: "Image 3",
  }
];



export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div>
        <img
          src= "./titleImage.png"
          alt="Title"
          className="w-1/2 h-auto mx-auto mb-4"
          style={{ maxWidth: "100%", height: "auto" }} // Responsive image
        />
      </div>
      <div className="grid grid-cols-3 gap-4 w-3/4 mx-auto bg-neutral-50">
        {images.map((image, index) => (
          <div key={index} >
            <img
              src={`./${image.src}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
      </div>
    </div>
  );
}
