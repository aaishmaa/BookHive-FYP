import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
 
// SavedPosts and Wishlist are the same feature — redirect to /wishlist
const SavedPosts = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/wishlist", { replace: true }); }, []);
  return null;
};
 
export default SavedPosts;