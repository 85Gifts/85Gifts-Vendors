// import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';

// interface LoginRequest {
//   email: string;
//   password: string;
// }

// interface TokenData {
//   token: string;
//   expires: string;
// }

// interface LoginSuccessResponse {
//   vendor: {
//     id: string;
//     name: string;
//     email: string;
//     role: string;
//   };
//   tokens: {
//     access: TokenData;
//     refresh: TokenData;
//   };
// }

// interface LoginErrorResponse {
//   message?: string;
//   error?: string;
//   detail?: string;
// }

// type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

// export async function POST(request: NextRequest) {
//   try {
//     const body: LoginRequest = await request.json();
    
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     const data: LoginResponse = await response.json();


//     if (!response.ok) {
//       const errorData = data as LoginErrorResponse;
//       return NextResponse.json(
//         { error: errorData.message || errorData.error || errorData.detail || 'Login failed' },
//         { status: response.status }
//       );
//     }
//     if (response.status === 401) {
//           // toast({
//           //   title: "Invalid credentials",
//           //   description: "Please check your credentials and try again",
//           //   variant: "destructive",
//           // });
//           console.log("Invalid credentials")
//           return;
//         }

//     // Type guard to ensure we have success response
//     const successData = data as LoginSuccessResponse;
//     console.log("Response:", successData)

//     // Store tokens in HTTP-only cookies
//     const cookieStore = await cookies();
    
//     if (successData.tokens?.access?.token) {
//       cookieStore.set('authToken', successData.tokens.access.token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 60 * 60, 
//         path: '/',
//       });
//     }
//         //       // 🔹 Store token in a cookie
//         // Cookies.set("authToken", data.data.data.tokens.accessToken, {
//         //   expires: 1, // 1 day
//         //   sameSite: "strict",
//         // });
//         //   console.log("✅ Success:", data);

//         // router.push('/dashboard');
    
//     if (successData.tokens?.refresh?.token) {
//       cookieStore.set('refreshToken', successData.tokens.refresh.token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 60 * 60 * 24 * 30, // 30 days
//         path: '/',
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       vendor: successData.vendor,
//       message: 'Login successful'
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }





import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface LoginRequest {
  email: string;
  password: string;
}

interface TokenData {
  token: string;
  expires: string;
}

interface LoginSuccessResponse {
  vendor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tokens: {
    access: TokenData;
    refresh: TokenData;
  };
}

interface LoginErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
}

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: LoginResponse = await response.json();

    // Log the raw API response structure
    console.log("=== RAW API RESPONSE ===");
    console.log("Full response data:", JSON.stringify(data, null, 2));
    console.log("Response keys:", Object.keys(data));
    console.log("Response type:", typeof data);

    if (!response.ok) {
      const errorData = data as LoginErrorResponse;
      return NextResponse.json(
        { error: errorData.message || errorData.error || errorData.detail || 'Login failed' },
        { status: response.status }
      );
    }
    if (response.status === 401) {
          // toast({
          //   title: "Invalid credentials",
          //   description: "Please check your credentials and try again",
          //   variant: "destructive",
          // });
          console.log("Invalid credentials")
          return;
        }

    // Type guard to ensure we have success response
    const successData = data as LoginSuccessResponse;


    // Safely unwrap the API envelope
    const raw = successData as any;
    const payload = raw?.data?.data;
    const accessToken = payload?.tokens?.accessToken;
    const refreshToken = payload?.tokens?.refreshToken;
    const vendor = payload?.vendor;

    // Store tokens in HTTP-only cookies
    const cookieStore = await cookies();

    if (accessToken) {
      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
    }

    if (refreshToken) {
      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // Store vendor _id and name in cookies
    if (vendor) {
      const vendorId = vendor._id || vendor.id;
      if (vendorId) {
        cookieStore.set('vendorId', vendorId, {
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
      }
      if (vendor.name) {
        cookieStore.set('vendorName', vendor.name, {
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
      }
    }

    return NextResponse.json({
      success: true,
      vendor,
      message: raw?.data?.message ?? 'Login successful',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
