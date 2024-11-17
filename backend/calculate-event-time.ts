interface TimeSlot {
    hour: number;
    minute: number;
}

interface GroupAvailability {
    [userId: string]: TimeSlot[]; // Array of TimeSlots when the user is available
}

interface RestaurantHours {
    [dayOfWeek: string]: { open: TimeSlot; close: TimeSlot };
}

function findOptimalStartTime(
    groupAvailability: GroupAvailability,
    restaurantHours: RestaurantHours,
    date: Date // The date of the event
  ): TimeSlot | null {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }); // Get day of week
  
    // Get the restaurant hours for the day of the week
    const restaurantOpen = restaurantHours[dayOfWeek]?.open;
    const restaurantClose = restaurantHours[dayOfWeek]?.close;
  
    if (!restaurantOpen || !restaurantClose) {
      // Restaurant is closed on this day
      return null;
    }
  
    let bestTime: TimeSlot | null = null;
    let maxAvailability = 0;
  
    // Iterate through possible times, starting from the restaurant's opening time
    for (
      let hour = restaurantOpen.hour;
      hour <= restaurantClose.hour;
      hour++
    ) {
      for (let minute = 0; minute < 60; minute += 30) { // Check every 30 minutes
        if (
          hour === restaurantClose.hour &&
          minute >= restaurantClose.minute
        ) {
          // Don't go past closing time
          break;
        }
  
        const currentTimeSlot: TimeSlot = { hour, minute };
        let availability = 0;
  
        // Check how many group members are available at this time
        for (const userId in groupAvailability) {
          if (
            groupAvailability[userId].some(
              (slot) =>
                slot.hour === currentTimeSlot.hour &&
                slot.minute === currentTimeSlot.minute
            )
          ) {
            availability++;
          }
        }
  
        // Update bestTime if current time slot has more availability
        if (availability > maxAvailability) {
          maxAvailability = availability;
          bestTime = currentTimeSlot;
        }
      }
    }
  
    return bestTime;
  }