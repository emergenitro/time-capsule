export default function Home() {
  return (
    <div style={{ 
      maxWidth: '50%', 
      margin: '10% auto', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      lineHeight: '1.6'
    }}>
      <h1>Reply Guy Bot</h1>
      <p>
        A Slack bot that creates a chain of absurdist mundane statements.
      </p>
      
      <h2>How it works:</h2>
      <ol>
        <li>Join the chain with <code>/reply-guy</code> in Slack</li>
        <li>Every day at a random time, you'll receive a mundane statement from a random person</li>
        <li>Reply to it with your own mundane observation</li>
        <li>Your reply becomes someone else's statement tomorrow</li>
      </ol>

      <h2>Examples:</h2>
      <ul>
        <li>"I had a sandwich today."</li>
        <li>"My coffee was lukewarm."</li>
        <li>"I saw a bird."</li>
        <li>"The weather exists."</li>
      </ul>

      <h2>Commands:</h2>
      <ul>
        <li><code>/reply-guy</code> - Join the chain</li>
        <li><code>/reply-guy-out</code> - Leave the chain</li>
        <li><code>/reply-guy-status</code> - Check if you owe a reply</li>
      </ul>
    </div>
  );
}
