
export default function Head() {
    const embed = {
      version: "1",
      imageUrl: "https://sudoku-rouge-zeta.vercel.app/sudoku.png?v=3",
      button: {
        title: "Launch Sudoku",
        action: {
          type: "launch_frame",
          name: "Sudoku",
          url: "https://sudoku-rouge-zeta.vercel.app",
          splashImageUrl: "https://sudoku-rouge-zeta.vercel.app/sudoku.png?v=3",
          splashBackgroundColor: "#ffffff"
        }
      }
    };
  
    return (
      <>
        <title>Sudoku</title>
        <meta name="fc:miniapp" content={JSON.stringify(embed)} />
        <meta name="fc:frame" content={JSON.stringify(embed)} />
      </>
    );
  }