import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {
  //buat usestatenya ngasih nilai dan setnilai
  const [value, setValue] = useState(() => {
    try {
      //ambil data nya pakai getItem masukin ke variabel
      const stored = localStorage.getItem(key);
      //dicek kosong atau engga kalau ada di parse kalau kosong pakai initial value = []
      if (stored !== null) {
        return JSON.parse(stored);
      } else {
        return initialValue;
      }
    } catch (error) {
      console.error('Error reading localStorage', error);
      return initialValue;
    }
  });

  //pakai useeffect buat nge set masukin data yang udah di uabh ke string dan berjalan kalau key sama valuenya update
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
