/**
 * @作者: nange
 * @日期: 2024-06-14
 * @功能: 这是一个Chrome扩展的内容脚本，用于从抖音页面提取文案，并通过API请求获取详细内容后，在页面上显示弹出框。用户可以复制文案或者关闭弹出框。
 */

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "fetchDouyinContent") {
    const url = window.location.href;
    showLoading();
    simulateProgress();
    fetchDouyinContent(url, function(response) {
      console.log(response);
      removeLoading();
      showPopup(response);
    });
  }
});

function fetchDouyinContent(url, callback) {
  fetch("https://api.coze.cn/open_api/v2/chat", {
    method: "POST",
    headers: {
      "Authorization": "Bearer pat_wCl1zjQDcQuALvHqK6DNhDKM1qfei4fwv0oWjuNKsLAcc37hjGx7LRpV2vJ0c6lk",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bot_id: "7380258877335928851",
      user: "12333333",
      query: url,
      stream: false
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.code === 0 && data.messages) {
      for (let message of data.messages) {
        if (message.content && message.content_type === "text" && message.type ==="answer") {
          try {
            const contentJson = JSON.parse(message.content);
            if (contentJson.content) {
              callback(contentJson.content);
              return;
            }
          } catch (e) {
            callback(message.content);
            return;
          }
        }
      }
      callback("当前接口正处于抖音官方测试版，若已超出了当日的调用限制次数，对此我们深感抱歉，给您带来了不便。需等到次日 0 点之后，便可够继续使用；预计会在 7 月份之后被修复，到时可以联系南哥VX+meihaoshenghuo6066 来获取最新的提取文案工具包！还有一个原因是，你得切实打开抖音电脑端的详情页，而不是列表页。再次为给您造成的困扰表示歉意。");
    } else {
      callback("当前接口正处于抖音官方测试版，若已超出了当日的调用限制次数，对此我们深感抱歉，给您带来了不便。需等到次日 0 点之后，便可够继续使用；预计会在 7 月份之后被修复，到时可以联系南哥VX+meihaoshenghuo6066 来获取最新的提取文案工具包！还有一个原因是，你得切实打开抖音电脑端的详情页，而不是列表页。再次为给您造成的困扰表示歉意。");
    }
  })
  .catch(error => {
    console.error("Error fetching content:", error);
    callback("API请求失败");
  });
}

function showPopup(content) {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.left = '50%';
  popup.style.top = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.padding = '20px';
  popup.style.backgroundColor = '#fff';
  popup.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
  popup.style.zIndex = '9999';
  popup.style.maxWidth = '80%';  // 限制最大宽度
  popup.style.overflowY = 'auto';  // 允许滚动

  const contentDiv = document.createElement('div');
  contentDiv.style.marginBottom = '10px';
  contentDiv.textContent = content;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'space-between';  // 按钮之间距离调整为6像素
  buttonContainer.style.gap = '6px';

  const copyButton = document.createElement('button');
  copyButton.textContent = '复制文案';
  copyButton.style.backgroundColor = '#009f5d';  // 设置背景色为浅绿色
  copyButton.style.color = '#fff';  // 设置文字颜色为白色
  copyButton.style.fontWeight = 'bold';  // 设置字体加粗
  copyButton.style.padding = '10px 20px';  // 增大按钮大小
  copyButton.onclick = function() {
    navigator.clipboard.writeText(content).then(function() {
      showCopyMessage('文案已复制');
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 4000);
    }, function() {
      showCopyMessage('复制失败');
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 4000);
    });
  };

  const relationDiv = document.createElement('div');
  relationDiv.textContent = "服务Q群：289437544";

  const closeButton = document.createElement('button');
  closeButton.textContent = '关闭';
  closeButton.style.padding = '10px 20px';  // 增大按钮大小
  closeButton.onclick = function() {
    document.body.removeChild(popup);
  };

  buttonContainer.appendChild(copyButton);
  buttonContainer.appendChild(relationDiv);
  buttonContainer.appendChild(closeButton);

  popup.appendChild(contentDiv);
  popup.appendChild(buttonContainer);

  document.body.appendChild(popup);
}

function showCopyMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.position = 'fixed';
  messageDiv.style.left = '50%';
  messageDiv.style.top = '50%';
  messageDiv.style.transform = 'translate(-50%, -50%)';
  messageDiv.style.padding = '10px 20px';
  messageDiv.style.backgroundColor = '#4CAF50';
  messageDiv.style.color = '#fff';
  messageDiv.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
  messageDiv.style.zIndex = '10000';

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    document.body.removeChild(messageDiv);
  }, 2000);
}

function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loadingDiv';
  loadingDiv.style.position = 'fixed';
  loadingDiv.style.left = '50%';
  loadingDiv.style.top = '50%';
  loadingDiv.style.transform = 'translate(-50%, -50%)';
  loadingDiv.style.padding = '45px';  // 增大整体大小
  loadingDiv.style.backgroundColor = '#f1c40f';  // 设置背景色为黄色
  loadingDiv.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
  loadingDiv.style.zIndex = '9999';

  const progressText = document.createElement('div');
  progressText.id = 'progressText';
  progressText.textContent = '文案提取中... 0%';
  progressText.style.color = '#000';  // 设置文字颜色为黑色
  progressText.style.fontWeight = 'bold';  // 设置字体加粗
  progressText.style.fontSize = '24px';  // 增大字体大小

  loadingDiv.appendChild(progressText);
  document.body.appendChild(loadingDiv);
}

function simulateProgress() {
  let progress = 0;
  const interval = setInterval(() => {
    if (progress < 100) {
      progress += 2;
      updateLoading(progress);
    } else {
      clearInterval(interval);
      const progressText = document.getElementById('progressText');
      if (progressText) {
        progressText.textContent = "文案较长，马上就好";
      }
    }
  }, 900);  // 将时间间隔调整为800ms，降低三分之一速度
}

function updateLoading(progress) {
  const progressText = document.getElementById('progressText');
  if (progressText) {
    progressText.textContent = `文案提取中... ${Math.round(progress)}%`;
  }
}

function removeLoading() {
  const loadingDiv = document.getElementById('loadingDiv');
  if (loadingDiv) {
    document.body.removeChild(loadingDiv);
  }
}