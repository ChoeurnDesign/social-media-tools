const { contextBridge, ipcRenderer } = require('electron');

// Automation state
let autoScrollInterval = null;
let automationSettings = {
  autoScroll: false,
  scrollSpeed: 100,
  autoLike: false,
  likeProbability: 0.3,
  autoFollow: false,
  followDailyLimit: 100,
  autoComment: false,
  commentProbability: 0.2,
  commentTemplates: []
};

// Follow count tracking
let followCountToday = 0;
let lastFollowDate = new Date().toDateString();

// Auto scroll functionality with randomization
function startAutoScroll(speed = 100) {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }

  console.log(`🔄 Auto-scroll started at base speed ${speed}ms`);

  let scrollCount = 0;
  let lastPauseAt = 0;

  autoScrollInterval = setInterval(() => {
    scrollCount++;
    
    // ✅ Human-like pauses: Random pause every 5-15 videos
    const videosBeforePause = Math.floor(Math.random() * 11) + 5;  // 5-15 videos
    if (scrollCount - lastPauseAt >= videosBeforePause) {
      console.log(`☕ Taking a human break after ${scrollCount - lastPauseAt} videos...`);
      clearInterval(autoScrollInterval);
      
      // ✅ Pause duration: 10-60 seconds
      const pauseDuration = Math.floor(Math.random() * 50000) + 10000;  // 10-60 seconds
      console.log(`⏸️ Pausing for ${Math.round(pauseDuration/1000)} seconds`);
      
      setTimeout(() => {
        lastPauseAt = scrollCount;
        console.log('▶️ Resuming auto-scroll after break');
        startAutoScroll(speed);
      }, pauseDuration);
      
      return;
    }
    
    // ✅ Wide scroll variation (±50% instead of ±30%)
    const baseScroll = 50 + Math.random() * 50;
    const scrollAmount = baseScroll * (0.5 + Math.random());  // ±50% variation
    
    console.log(`📜 Scrolling ${Math.round(scrollAmount)}px (video ${scrollCount})`);
    
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth'
    });
    
    // Loop back to top when reaching bottom
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      console.log('🔁 Reached bottom, scrolling back to top');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollCount = 0;  // Reset count
        lastPauseAt = 0;
      }, 1000 + Math.random() * 2000);
    }

    // ✅ Random actions with varying probabilities
    if (automationSettings.autoLike && Math.random() < automationSettings.likeProbability) {
      // Add random delay before liking (1-5 seconds)
      setTimeout(() => tryAutoLike(), 1000 + Math.random() * 4000);
    }

    if (automationSettings.autoFollow && Math.random() < 0.05) {  // Lower probability for follows
      setTimeout(() => tryAutoFollow(), 2000 + Math.random() * 6000);
    }

    if (automationSettings.autoComment && Math.random() < automationSettings.commentProbability) {
      setTimeout(() => tryAutoComment(), 3000 + Math.random() * 7000);
    }
    
  }, speed + Math.random() * speed);  // ✅ ±100% interval variation (was ±50%)
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    console.log('⏹️ Auto-scroll stopped');
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

// Auto like functionality
function tryAutoLike() {
  if (Math.random() > automationSettings.likeProbability) {
    return false;
  }

  // Find TikTok like button (multiple selectors for compatibility)
  const likeButton = document.querySelector('[data-e2e="like-icon"]') ||
                     document.querySelector('[data-e2e="browse-like"]') ||
                     document.querySelector('[aria-label*="like"]') ||
                     document.querySelector('[aria-label*="Like"]');
  
  if (likeButton && !likeButton.classList.contains('liked')) {
    // Random delay before clicking (human-like)
    setTimeout(() => {
      likeButton.click();
      console.log('❤️ Auto-liked video');
    }, 1000 + Math.random() * 3000);
    return true;
  }
  return false;
}

// Auto follow functionality
function tryAutoFollow() {
  // Check daily limit
  const today = new Date().toDateString();
  if (today !== lastFollowDate) {
    followCountToday = 0;
    lastFollowDate = today;
  }

  if (followCountToday >= automationSettings.followDailyLimit) {
    return false;
  }

  if (Math.random() > 0.1) { // Lower probability for follows
    return false;
  }

  // Find follow button
  const followButton = document.querySelector('[data-e2e="follow-button"]') ||
                       document.querySelector('[data-e2e="browse-follow"]');
  
  if (followButton && followButton.textContent.toLowerCase().includes('follow')) {
    setTimeout(() => {
      followButton.click();
      followCountToday++;
      console.log(`Auto-followed user (${followCountToday}/${automationSettings.followDailyLimit} today)`);
    }, 2000 + Math.random() * 4000);
    return true;
  }
  return false;
}

// Auto comment functionality
function tryAutoComment() {
  if (Math.random() > automationSettings.commentProbability) {
    return false;
  }

  if (!automationSettings.commentTemplates || automationSettings.commentTemplates.length === 0) {
    return false;
  }

  // Random template selection
  const template = automationSettings.commentTemplates[
    Math.floor(Math.random() * automationSettings.commentTemplates.length)
  ];
  
  // Spin syntax support: {Hello|Hi|Hey}
  const comment = processSpinSyntax(template);
  
  // Find comment input
  const commentBox = document.querySelector('[data-e2e="comment-input"]') ||
                     document.querySelector('[data-e2e="browse-comment-input"]') ||
                     document.querySelector('textarea[placeholder*="comment"]');
  
  if (commentBox) {
    commentBox.focus();
    commentBox.value = comment;
    
    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true });
    commentBox.dispatchEvent(inputEvent);
    
    setTimeout(() => {
      const submitBtn = document.querySelector('[data-e2e="comment-post"]') ||
                        document.querySelector('[data-e2e="browse-comment-post"]') ||
                        document.querySelector('button[type="submit"]');
      
      if (submitBtn) {
        submitBtn.click();
        console.log('Auto-commented:', comment);
      }
    }, 1000 + Math.random() * 2000);
    return true;
  }
  return false;
}

// Process spin syntax
function processSpinSyntax(text) {
  return text.replace(/\{([^}]+)\}/g, (match, options) => {
    const choices = options.split('|');
    return choices[Math.floor(Math.random() * choices.length)];
  });
}

// Listen for automation commands from main process
ipcRenderer.on('automation-command', (event, data) => {
  console.log('🤖 Automation command received:', data);
  
  const { command, ...params } = data;

  switch (command) {
    case 'start-auto-scroll':
      console.log('▶️ Starting auto-scroll with speed:', params.speed || automationSettings.scrollSpeed);
      startAutoScroll(params.speed || automationSettings.scrollSpeed);
      break;
    
    case 'stop-auto-scroll':
      console.log('⏹️ Stopping auto-scroll');
      stopAutoScroll();
      break;
    
    case 'update-settings':
      console.log('⚙️ Updating automation settings:', params.settings);
      automationSettings = { ...automationSettings, ...params.settings };
      break;
    
    case 'trigger-like':
      console.log('❤️ Triggering like');
      tryAutoLike();
      break;
    
    case 'trigger-follow':
      console.log('➕ Triggering follow');
      tryAutoFollow();
      break;
    
    case 'trigger-comment':
      console.log('💬 Triggering comment');
      tryAutoComment();
      break;
    
    default:
      console.log('❓ Unknown automation command:', command);
  }
});

// Expose minimal API to renderer (if needed)
contextBridge.exposeInMainWorld('mobileAutomation', {
  startScroll: (speed) => ipcRenderer.send('mobile-action', { action: 'start-scroll', speed }),
  stopScroll: () => ipcRenderer.send('mobile-action', { action: 'stop-scroll' }),
  getStatus: () => ({
    scrolling: autoScrollInterval !== null,
    followsToday: followCountToday
  })
});

console.log('Mobile automation preload initialized');

// ✅ Randomized Initial Behavior (Anti-Detection)
// This makes each account start differently to avoid synchronized patterns
window.addEventListener('DOMContentLoaded', () => {
  // ✅ Random initial delay (3-13 seconds) before any action
  const initialDelay = Math.floor(Math.random() * 10000) + 3000;
  
  console.log(`⏳ Waiting ${Math.round(initialDelay/1000)}s before initial behavior (anti-detection)`);
  
  setTimeout(() => {
    // ✅ Random initial scrolls (0-5 videos) to randomize starting position
    const initialScrolls = Math.floor(Math.random() * 6);
    
    if (initialScrolls > 0) {
      console.log(`🎲 Performing ${initialScrolls} random initial scrolls to vary starting position`);
      
      for (let i = 0; i < initialScrolls; i++) {
        setTimeout(() => {
          // Random scroll speed for each initial scroll
          const scrollDelay = 2000 + Math.random() * 3000;  // 2-5 seconds between scrolls
          
          window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth'
          });
          
          console.log(`📜 Initial scroll ${i + 1}/${initialScrolls}`);
        }, i * (2000 + Math.random() * 3000));
      }
    } else {
      console.log('🎯 Starting at default position (no initial scrolls)');
    }
  }, initialDelay);
});
