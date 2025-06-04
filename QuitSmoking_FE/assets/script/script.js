const BACKEND_URL = "http://localhost:8080/api"; // Đảm bảo đúng cổng và đường dẫn

let jwtToken = ""; // Biến để lưu JWT token

// Đảm bảo DOM đã tải hoàn chỉnh trước khi thêm sự kiện
document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded and running!");

  // --- Chức năng ẩn/hiện mật khẩu ---
  function setupPasswordToggle(passwordInputId) {
    const passwordInput = document.getElementById(passwordInputId);
    // Kiểm tra xem input mật khẩu có tồn tại không
    const togglePasswordIcon = passwordInput
      ? passwordInput.nextElementSibling
      : null;

    if (
      passwordInput &&
      togglePasswordIcon &&
      togglePasswordIcon.classList.contains("toggle-password")
    ) {
      togglePasswordIcon.addEventListener("click", function () {
        const type =
          passwordInput.getAttribute("type") === "password"
            ? "text"
            : "password";
        passwordInput.setAttribute("type", type);
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
      });
      console.log(
        `Toggle password setup for: '${passwordInputId}' successfully.`
      );
    } else {
      // Log cảnh báo nếu không tìm thấy cặp input/icon cho ID này trên trang hiện tại
      console.warn(
        `[TogglePassword] Input with ID '${passwordInputId}' or its corresponding toggle icon not found.`
      );
    }
  }

  // Gọi hàm setupPasswordToggle cho từng ID của input mật khẩu bạn có
  // Chỉ những ID có mặt trên trang hiện tại mới được thiết lập thành công
  setupPasswordToggle("logPassword"); // Cho input mật khẩu trên trang đăng nhập
  setupPasswordToggle("regPassword"); // Cho input mật khẩu chính trên trang đăng ký
  setupPasswordToggle("regConfirmPassword"); // Cho input xác nhận mật khẩu trên trang đăng ký

  // --- Đăng ký ---
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    // Kiểm tra xem form đăng ký có tồn tại trên trang này không
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Ngăn chặn form submit mặc định

      const username = document.getElementById("regUsername").value;
      const password = document.getElementById("regPassword").value;
      const confirmPassword =
        document.getElementById("regConfirmPassword").value;
      const email = document.getElementById("regEmail").value;

      // const firstName = document.getElementById("regFirstName").value;
      // const lastName = document.getElementById("regLastName").value;

      // Người dùng sẽ nhập first name và last name sau khi đăng nhập thành công
      const firstName = "";
      const lastName = "";

      if (password !== confirmPassword) {
        const messageElement = document.getElementById("registerMessage");
        if (messageElement) {
          messageElement.textContent =
            "Đăng ký thất bại: Mật khẩu và xác nhận mật khẩu không khớp.";
          messageElement.style.color = "red";
        } else {
          console.error("Mật khẩu và xác nhận mật khẩu không khớp.");
          alert("Mật khẩu và xác nhận mật khẩu không khớp."); // Fallback alert nếu không có messageElement
        }
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            email,
            firstName,
            lastName,
            requestedRole: "GUEST",
          }),
        });

        const data = await response.json();
        const messageElement = document.getElementById("registerMessage");

        if (response.ok) {
          messageElement.textContent = "Đăng ký thành công!";
          messageElement.style.color = "green";
          setTimeout(() => {
            window.location.href = "login.html"; // Chuyển hướng đến trang đăng nhập
          }, 1500);
        } else {
          messageElement.textContent =
            "Đăng ký thất bại: " + (data.message || JSON.stringify(data));
          messageElement.style.color = "red";
        }
      } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        document.getElementById("registerMessage").textContent =
          "Có lỗi xảy ra khi đăng ký.";
        document.getElementById("registerMessage").style.color = "red";
      }
    });
  } else {
    console.warn("Register form not found on this page."); // Thêm log này
  }

  // --- Đăng nhập ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    // Kiểm tra xem form đăng nhập có tồn tại trên trang này không
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log("Login form submitted!"); // Kiểm tra event listener

      // Đảm bảo lấy giá trị SAU KHI form đã được submit
      const usernameInput = document.getElementById("logUsername");
      const passwordInput = document.getElementById("logPassword");

      if (!usernameInput || !passwordInput) {
        console.error("Không tìm thấy input username hoặc password.");
        document.getElementById("loginMessage").textContent =
          "Lỗi: Không tìm thấy trường nhập liệu.";
        document.getElementById("loginMessage").style.color = "red";
        return; // Dừng lại nếu không tìm thấy input
      }

      const username = usernameInput.value;
      const password = passwordInput.value;
      console.log("Attempting login with:", { username, password }); // Kiểm tra giá trị nhập vào

      try {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json(); // data bây giờ sẽ chứa { token: "...", username: "...", role: "..." }
        const messageElement = document.getElementById("loginMessage");
        const tokenElement = document.getElementById("jwtToken");

        if (response.ok) {
          jwtToken = data.token; // Lưu token
          messageElement.textContent = "Đăng nhập thành công!";
          messageElement.style.color = "green";
          tokenElement.textContent = jwtToken;

          //--LOGIC CHUYỂN HƯỚNG TỚI TRANG THEO ROLE CỦA NGƯỜI DÙNG--
          const userRole = data.role; // Lấy role từ dữ liệu trả về
          console.log("User role cua nguoi dung:", username, " La: ", userRole);

          let redirectUrl;
          switch (userRole) {
            case "ADMIN":
              redirectUrl = "admin.html"; // Sửa đường dẫn nếu cần
              break;
            case "MEMBER":
              redirectUrl = "member.html"; // Sửa đường dẫn nếu cần
              break;
            case "GUEST":
              redirectUrl = "guest.html"; // Sửa đường dẫn nếu cần
              break;
            case "COACH":
              redirectUrl = "coach.html"; // Sửa đường dẫn nếu cần
              break;
            default:
              console.warn(
                "Role không xác định, chuyển hướng về trang đăng nhập."
              );
              redirectUrl = "login.html";
          }

          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1500);
        } else {
          messageElement.textContent =
            "Đăng nhập thất bại: " + (data.message || JSON.stringify(data));
          messageElement.style.color = "red";
          tokenElement.textContent = "N/A";
        }
      } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        document.getElementById("loginMessage").textContent =
          "Có lỗi xảy ra khi đăng nhập.";
        document.getElementById("loginMessage").style.color = "red";
      }
    });
  } else {
    console.warn("Login form not found on this page."); // Thêm log này
  }

  // --- Truy cập API bảo vệ (nếu có trên trang này) ---
  const accessProtectedButton = document.getElementById("accessProtected");
  if (accessProtectedButton) {
    accessProtectedButton.addEventListener("click", async () => {
      const protectedMessageElement =
        document.getElementById("protectedMessage");
      if (!jwtToken) {
        protectedMessageElement.textContent = "Vui lòng đăng nhập trước!";
        protectedMessageElement.style.color = "orange";
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/some_protected_resource`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          protectedMessageElement.textContent =
            "Dữ liệu bảo vệ: " + JSON.stringify(data);
          protectedMessageElement.style.color = "blue";
        } else {
          protectedMessageElement.textContent =
            "Truy cập dữ liệu bảo vệ thất bại: " +
            (data.message || JSON.stringify(data));
          protectedMessageElement.style.color = "red";
        }
      } catch (error) {
        console.error("Lỗi khi truy cập API bảo vệ:", error);
        protectedMessageElement.textContent =
          "Có lỗi xảy ra khi truy cập dữ liệu bảo vệ.";
        protectedMessageElement.style.color = "red";
      }
    });
  }
}); // Kết thúc DOMContentLoaded
