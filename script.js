document.addEventListener('DOMContentLoaded', function () {
  const startDatePicker = document.getElementById('start-date');

  function getMostRecentMonday(d) {
      const date = new Date(d);
      const day = date.getDay(),
          diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      date.setDate(diff);
      return new Date(date.setHours(0, 0, 0, 0)); // Reset time to 00:00:00 for consistency
  }

  function initScheduler(startDate) {
      const scheduler = document.getElementById('scheduler');
      scheduler.innerHTML = '';

      // Ensure that we start from Monday regardless of the startDate provided
      startDate = getMostRecentMonday(startDate);

      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const startHour = 8;
      const endHour = 18;
      const minutes = ['00', '30'];

      for (let i = 0; i < days.length; i++) {
          // Calculate the date for the current day of the week
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + i);

          const dayDiv = document.createElement('div');
          dayDiv.className = 'day';
          // Use toLocaleDateString for better control over the output format
          dayDiv.innerHTML = `<strong>${days[i]} (${currentDate.toLocaleDateString()})</strong>`;

          for (let hour = startHour; hour < endHour; hour++) {
              minutes.forEach(minute => {
                  const time = `${hour % 24}:${minute} ${hour < 12 ? 'AM' : 'PM'}`;
                  const timeSlot = document.createElement('div');
                  timeSlot.className = 'time-slot';
                  timeSlot.dataset.time = time;
                  timeSlot.innerHTML = `<span class="time-display">${time}</span>`;
                  dayDiv.appendChild(timeSlot);
              });
          }
          scheduler.appendChild(dayDiv);
      }
  }

  function allowDrop(event) {
      event.preventDefault();
  }

  function drag(event) {
      event.dataTransfer.setData("text", event.target.dataset.id);
      event.dataTransfer.setData("isClone", event.target.classList.contains('clone') ? "yes" : "no");
  }

  function drop(event) {
      event.preventDefault();
      const data = event.dataTransfer.getData("text");
      const isClone = event.dataTransfer.getData("isClone") === "yes";
      let draggableElement = document.querySelector(`.order[data-id="${data}"]`);
      const dropzone = event.target.closest('.time-slot, #unscheduled, #cleans');

      if (dropzone) {
          if (dropzone.id === 'unscheduled' || dropzone.id === 'cleans') {
              unscheduleOrder(draggableElement, dropzone);
          } else {
              if (!isClone && draggableElement.classList.contains('clean')) {
                  const clone = draggableElement.cloneNode(true);
                  clone.classList.add('clone');
                  clone.setAttribute('data-id', `${data}-clone-${new Date().getTime()}`);
                  clone.addEventListener('dragstart', drag);
                  dropzone.appendChild(clone);
                  setTimeDisplay(clone, dropzone.dataset.time);
                  orders.push({ id: clone.getAttribute('data-id'), time: dropzone.dataset.time });
              } else {
                  dropzone.appendChild(draggableElement);
                  setTimeDisplay(draggableElement, dropzone.dataset.time);
                  orders.push({ id: draggableElement.getAttribute('data-id'), time: dropzone.dataset.time });
              }
          }
      }
  }

  function unscheduleOrder(order, dropzone) {
      if (order.classList.contains('clean')) {
          dropzone = document.getElementById('cleans');
      } else {
          dropzone = document.getElementById('unscheduled');
      }
      dropzone.appendChild(order);
      order.classList.remove('clone');
      const timeDisplay = order.querySelector('.time-display');
      if (timeDisplay) timeDisplay.remove();
      const unscheduleButton = order.querySelector('.unschedule-button');
      if (unscheduleButton) unscheduleButton.remove();
      order.setAttribute('draggable', 'true');
      orders = orders.filter(item => item.id !== order.getAttribute('data-id'));
  }

  function updateScheduler() {
      let selectedDate = new Date(startDatePicker.value);
      let lastMonday = getMostRecentMonday(selectedDate);
      initScheduler(lastMonday);
  }

  // Function to reorder orders
  function reorderOrders() {
      const scheduler = document.getElementById('scheduler');
      orders.forEach(item => {
          const orderElement = document.querySelector(`.order[data-id="${item.id}"]`);
          if (orderElement) {
              const timeSlot = scheduler.querySelector(`.time-slot[data-time="${item.time}"]`);
              if (timeSlot) {
                  timeSlot.appendChild(orderElement);
                  setTimeDisplay(orderElement, item.time);
              }
          }
      });
  }

  // Initialize orders array
  let orders = [];

  // Function to set time display
  function setTimeDisplay(order, time) {
      let timeDisplay = order.querySelector('.time-display');
      if (!timeDisplay) {
          timeDisplay = document.createElement('div');
          timeDisplay.className = 'time-display';
          order.appendChild(timeDisplay);
      }
      timeDisplay.textContent = time;

      let unscheduleButton = order.querySelector('.unschedule-button');
      if (!unscheduleButton) {
          unscheduleButton = document.createElement('button');
          unscheduleButton.textContent = 'Unschedule';
          unscheduleButton.className = 'unschedule-button';
          unscheduleButton.onclick = function () { unscheduleOrder(order); };
          order.appendChild(unscheduleButton);
      }
  }

  // Set initial value to the most recent Monday
  const currentDate = new Date();
  const mostRecentMonday = getMostRecentMonday(currentDate);
  startDatePicker.value = mostRecentMonday.toISOString().slice(0, 10);

  // Initialize the scheduler with the most recent Monday
  initScheduler(mostRecentMonday);

  // Event listener for changing the date
  startDatePicker.addEventListener('change', function () {
      let selectedDate = new Date(this.value);
      let lastMonday = getMostRecentMonday(selectedDate);
      initScheduler(lastMonday);
  });

  // Add event listeners for drag and drop functionality
  const ordersElements = document.querySelectorAll('.order');
  const timeSlots = document.querySelectorAll('.time-slot, #unscheduled, #cleans');

  ordersElements.forEach(order => {
      order.addEventListener('dragstart', drag);
  });

  timeSlots.forEach(slot => {
      slot.addEventListener('dragover', allowDrop);
      slot.addEventListener('drop', drop);
  });
});
